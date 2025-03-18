import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $createTextNode,
  TextNode,
  $isTextNode,
  $isParagraphNode,
  ParagraphNode,
} from "lexical";
import { $createEntityNode, $isEntityNode } from "./EntityNode";

interface EntityData {
  people: {
    name: string;
    variants: string[];
    info: string;
  }[];
  organizations: {
    name: string;
    variants: string[];
    info: string;
  }[];
  places: {
    name: string;
    variants: string[];
    info: string;
  }[];
}

interface EntityDetectionPluginProps {
  entityData: EntityData;
}

export function EntityDetectionPlugin({
  entityData,
}: EntityDetectionPluginProps) {
  const [editor] = useLexicalComposerContext();

  const findAllOccurrences = (text: string, searchString: string) => {
    const indices: number[] = [];
    const lowerText = text.toLowerCase();
    const lowerSearchString = searchString.toLowerCase();
    let index = lowerText.indexOf(lowerSearchString);

    while (index !== -1) {
      indices.push(index);
      index = lowerText.indexOf(
        lowerSearchString,
        index + lowerSearchString.length
      );
    }

    return indices;
  };

  const findEntitiesInText = (text: string) => {
    const entities: {
      index: number;
      length: number;
      entity: any;
      type: string;
      text: string;
    }[] = [];

    (["people", "organizations", "places"] as const).forEach((type) => {
      entityData[type].forEach((entityItem) => {
        const allNames = [entityItem.name, ...entityItem.variants].filter(
          Boolean
        );
        allNames.forEach((name) => {
          if (!name || !name.trim()) return;

          const indices = findAllOccurrences(text, name);
          indices.forEach((index) => {
            const actualText = text.substring(index, index + name.length);
            entities.push({
              index,
              length: name.length,
              entity: entityItem,
              type,
              text: actualText,
            });
          });
        });
      });
    });

    entities.sort((a, b) => a.index - b.index);

    const filteredEntities = entities.filter((entity, index) => {
      for (let i = 0; i < index; i++) {
        const prevEntity = entities[i];
        if (
          entity.index >= prevEntity.index &&
          entity.index < prevEntity.index + prevEntity.length
        ) {
          return false;
        }
      }
      return true;
    });

    return filteredEntities;
  };

  // Register a node transform for text nodes
  useEffect(() => {
    // This transform will be called for every text node in the editor
    const removeTextTransform = editor.registerNodeTransform(
      TextNode,
      (textNode) => {
        // Skip if this is already part of an entity node
        if (textNode.getParent() && $isEntityNode(textNode.getParent())) {
          return;
        }

        const text = textNode.getTextContent();
        if (!text.trim()) return;

        const entities = findEntitiesInText(text);
        if (entities.length === 0) return;

        // Get the parent paragraph
        const paragraph = textNode.getParent();
        if (!paragraph || !$isParagraphNode(paragraph)) return;

        // Process the text node
        let lastIndex = 0;

        // Create a temporary array to hold the new nodes
        const newNodes = [];

        entities.forEach((entity) => {
          if (entity.index > lastIndex) {
            // Add text before the entity
            newNodes.push(
              $createTextNode(text.substring(lastIndex, entity.index))
            );
          }

          // Create and add the entity node
          const entityNode = $createEntityNode(
            entity.text,
            entity.type,
            entity.entity.name,
            entity.entity.info
          );
          newNodes.push(entityNode);

          lastIndex = entity.index + entity.length;
        });

        // Add any remaining text
        if (lastIndex < text.length) {
          newNodes.push($createTextNode(text.substring(lastIndex)));
        }

        // Replace the original text node with the new nodes
        if (newNodes.length > 0) {
          // Insert all new nodes before the text node
          for (let i = 0; i < newNodes.length; i++) {
            textNode.insertBefore(newNodes[i]);
          }
          // Remove the original text node
          textNode.remove();
        }
      }
    );

    // Also register a transform for paragraphs to handle newly created paragraphs
    const removeParagraphTransform = editor.registerNodeTransform(
      ParagraphNode,
      (node) => {
        // Check if this paragraph has only text nodes (no entity nodes)
        let hasOnlyTextNodes = false;
        const children = node.getChildren();

        if (children.length > 0) {
          hasOnlyTextNodes = children.every(
            (child) => $isTextNode(child) && !$isEntityNode(child)
          );
        }

        // If it has only text nodes, process it
        if (hasOnlyTextNodes) {
          const text = node.getTextContent();
          if (!text.trim()) return;

          const entities = findEntitiesInText(text);
          if (entities.length === 0) return;

          // Clear and rebuild the paragraph
          node.clear();
          let lastIndex = 0;

          entities.forEach((entity) => {
            if (entity.index > lastIndex) {
              node.append(
                $createTextNode(text.substring(lastIndex, entity.index))
              );
            }

            const entityNode = $createEntityNode(
              entity.text,
              entity.type,
              entity.entity.name,
              entity.entity.info
            );

            node.append(entityNode);
            lastIndex = entity.index + entity.length;
          });

          if (lastIndex < text.length) {
            node.append($createTextNode(text.substring(lastIndex)));
          }
        }
      }
    );

    return () => {
      removeTextTransform();
      removeParagraphTransform();
    };
  }, [editor, entityData]);

  return null;
}
