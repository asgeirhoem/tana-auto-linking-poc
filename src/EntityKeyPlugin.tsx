import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_TAB_COMMAND,
  KEY_SPACE_COMMAND,
  $createTextNode,
  $createParagraphNode,
} from "lexical";
import { $isEntityNode } from "./EntityNode";

export function EntityKeyPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Handle right arrow key at the end of an entity
    const removeRightArrowListener = editor.registerCommand(
      KEY_ARROW_RIGHT_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        const node = selection.anchor.getNode();

        // Check if we're at the end of an entity node
        if (
          $isEntityNode(node) &&
          selection.anchor.offset === node.getTextContent().length
        ) {
          // Prevent default behavior
          if (event) {
            event.preventDefault();
          }

          // Create a space node after the entity
          editor.update(() => {
            const spaceNode = $createTextNode(" ");
            node.insertAfter(spaceNode);

            // Explicitly select the space node
            spaceNode.select(0, 0);
          });
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // Handle space key at the end of an entity
    const removeSpaceListener = editor.registerCommand(
      KEY_SPACE_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        const node = selection.anchor.getNode();

        // Check if we're at the end of an entity node
        if (
          $isEntityNode(node) &&
          selection.anchor.offset === node.getTextContent().length
        ) {
          // Prevent default behavior
          if (event) {
            event.preventDefault();
          }

          // Create a space node after the entity and move selection there
          editor.update(() => {
            const spaceNode = $createTextNode("  "); // Two spaces to ensure visibility
            node.insertAfter(spaceNode);

            // Explicitly select after the first space
            spaceNode.select(1, 1);
          });
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // Handle tab key at the end of an entity
    const removeTabListener = editor.registerCommand(
      KEY_TAB_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        const node = selection.anchor.getNode();

        // Check if we're at the end of an entity node
        if (
          $isEntityNode(node) &&
          selection.anchor.offset === node.getTextContent().length
        ) {
          // Prevent default behavior
          if (event) {
            event.preventDefault();
          }

          // Create a space node after the entity
          editor.update(() => {
            const spaceNode = $createTextNode(" ");
            node.insertAfter(spaceNode);

            // Explicitly select the space node
            spaceNode.select(0, 0);
          });
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    return () => {
      removeRightArrowListener();
      removeSpaceListener();
      removeTabListener();
    };
  }, [editor]);

  return null;
}
