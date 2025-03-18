import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $createTextNode, TextNode } from "lexical";
import { $createEntityNode, $isEntityNode } from "./EntityNode";

// Helper function to escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
}

interface EntityDetectionPluginProps {
  entityData: EntityData;
}

export function EntityDetectionPlugin({
  entityData,
}: EntityDetectionPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Register a listener for text changes
    const removeUpdateListener = editor.registerUpdateListener(() => {
      // Skip processing if the editor is composing
      if (editor.isComposing()) {
        return;
      }

      // Process entities on the next frame to avoid disrupting typing
      setTimeout(() => {
        // Attempt to detect entities in the editor content
        try {
          editor.update(() => {
            // Get the root element
            const root = $getRoot();

            // Get all paragraphs
            const paragraphs = root.getChildren();

            // For each paragraph, check if it contains entity names
            paragraphs.forEach((paragraph) => {
              // Get the text content of the paragraph
              const text = paragraph.getTextContent();

              // Skip empty paragraphs
              if (!text.trim()) return;

              // Log the paragraph text for debugging
              console.log("Processing paragraph:", text);

              // Get all text nodes in the paragraph (need to cast to any due to TypeScript limitations)
              const textNodes = (paragraph as any).getChildren();

              // Process each text node
              textNodes.forEach((node: any) => {
                // Skip if not a text node or already an entity node
                if (!(node instanceof TextNode) || $isEntityNode(node)) {
                  return;
                }

                const nodeText = node.getTextContent();

                // Check for entities in the text node
                for (const type in entityData) {
                  const entityType = type as keyof EntityData;

                  entityData[entityType].forEach((entity) => {
                    // Check if the entity name is in the text
                    if (nodeText.includes(entity.name)) {
                      console.log(`Found entity: ${entity.name} (${type})`);

                      // Split the text node at the entity
                      const parts = nodeText.split(entity.name);

                      // If the entity is at the beginning
                      if (parts[0] === "") {
                        // Replace the text node with an entity node
                        const entityNode = $createEntityNode(
                          entity.name,
                          entityType.toString(),
                          entity.name,
                          entity.info
                        );

                        // If there's text after the entity, add it as a new text node
                        if (parts[1]) {
                          const afterNode = $createTextNode(parts[1]);
                          node.replace(entityNode);
                          entityNode.insertAfter(afterNode);
                        } else {
                          node.replace(entityNode);
                        }
                      }
                      // If the entity is in the middle or at the end
                      else {
                        // Create a text node for the text before the entity
                        const beforeNode = $createTextNode(parts[0]);

                        // Create an entity node for the entity
                        const entityNode = $createEntityNode(
                          entity.name,
                          entityType.toString(),
                          entity.name,
                          entity.info
                        );

                        // Replace the original node with the before node
                        node.replace(beforeNode);

                        // Insert the entity node after the before node
                        beforeNode.insertAfter(entityNode);

                        // If there's text after the entity, add it as a new text node
                        if (parts[1]) {
                          const afterNode = $createTextNode(parts[1]);
                          entityNode.insertAfter(afterNode);
                        }
                      }
                    }
                  });
                }
              });
            });
          });
        } catch (error) {
          console.error("Error processing entities:", error);
        }
      }, 0);
    });

    return removeUpdateListener;
  }, [editor, entityData]);

  return null;
}
