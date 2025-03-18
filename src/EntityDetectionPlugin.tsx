import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $createTextNode,
  TextNode,
  ElementNode,
  LexicalEditor,
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
}

interface EntityDetectionPluginProps {
  entityData: EntityData;
}

export function EntityDetectionPlugin({
  entityData,
}: EntityDetectionPluginProps) {
  const [editor] = useLexicalComposerContext();

  // Function to detect and mark entities in the editor content
  const detectEntities = (editor: LexicalEditor) => {
    editor.update(() => {
      // Get all paragraphs in the editor
      const root = $getRoot();
      const paragraphs = root.getChildren();

      // Process each paragraph
      paragraphs.forEach((paragraph) => {
        if (!(paragraph instanceof ElementNode)) return;

        // Get the text content of the paragraph
        const text = paragraph.getTextContent();
        if (!text.trim()) return;

        // Clear the paragraph
        paragraph.clear();

        // Process the text to find and mark entities
        let remainingText = text;
        let startIndex = 0;

        // Keep processing until we've gone through the entire text
        while (remainingText.length > 0) {
          let entityFound = false;
          let matchedEntity = null;
          let matchedText = "";
          let matchedType = "";
          let matchIndex = Infinity;

          // Check for people entities
          for (const person of entityData.people) {
            const allNames = [person.name, ...person.variants].filter(Boolean);

            for (const name of allNames) {
              const index = remainingText.indexOf(name);
              if (index !== -1 && index < matchIndex) {
                matchIndex = index;
                matchedEntity = person;
                matchedText = name;
                matchedType = "people";
                entityFound = true;
              }
            }
          }

          // Check for organization entities
          for (const org of entityData.organizations) {
            const allNames = [org.name, ...org.variants].filter(Boolean);

            for (const name of allNames) {
              const index = remainingText.indexOf(name);
              if (index !== -1 && index < matchIndex) {
                matchIndex = index;
                matchedEntity = org;
                matchedText = name;
                matchedType = "organizations";
                entityFound = true;
              }
            }
          }

          // If an entity was found
          if (entityFound && matchedEntity && matchIndex !== Infinity) {
            // Add text before the entity if there is any
            if (matchIndex > 0) {
              const beforeText = remainingText.substring(0, matchIndex);
              paragraph.append($createTextNode(beforeText));
            }

            // Add the entity node
            paragraph.append(
              $createEntityNode(
                matchedText,
                matchedType,
                matchedEntity.name,
                matchedEntity.info
              )
            );

            // Update the remaining text
            remainingText = remainingText.substring(
              matchIndex + matchedText.length
            );
          } else {
            // No more entities found, add the remaining text
            paragraph.append($createTextNode(remainingText));
            remainingText = "";
          }
        }
      });
    });
  };

  useEffect(() => {
    // Process initial content
    setTimeout(() => {
      detectEntities(editor);
    }, 500);

    // Listen for changes to the editor content
    const removeUpdateListener = editor.registerUpdateListener(
      ({ editorState, prevEditorState, tags }) => {
        // Skip if this update was triggered by our own entity detection
        if (tags.has("entity-detection")) return;

        // Only process if the content has actually changed
        if (
          editorState.read(() => $getRoot().getTextContent()) ===
          prevEditorState.read(() => $getRoot().getTextContent())
        ) {
          return;
        }

        // Detect entities after a short delay to avoid disrupting typing
        setTimeout(() => {
          detectEntities(editor);
        }, 200);
      }
    );

    return removeUpdateListener;
  }, [editor, entityData]);

  return null;
}
