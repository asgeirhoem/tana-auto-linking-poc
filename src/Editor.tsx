import React, { useState, useEffect, useCallback } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  EditorState,
  NodeKey,
} from "lexical";

import { EntityNode } from "./EntityNode";
import { EntityDetectionPlugin } from "./EntityDetectionPlugin";
import { PreviewCard } from "./PreviewCard";

// Entity data for demonstration
const entityData = {
  people: [
    {
      name: "David Byrne",
      variants: ["Byrne", "David"],
      info: "Lead singer of Talking Heads.",
    },
    {
      name: "Brian Eno",
      variants: ["Eno", "Brian"],
      info: "Renowned music producer and artist.",
    },
    {
      name: "Phil Collins",
      variants: ["Collins", "Phil"],
      info: "Drummer and singer of Genesis.",
    },
    {
      name: "Kate Bush",
      variants: ["Bush", "Kate"],
      info: "Influential British singer-songwriter.",
    },
  ],
  organizations: [
    {
      name: "Talking Heads",
      variants: ["The Talking Heads"],
      info: "American rock band formed in 1975.",
    },
    {
      name: "Genesis",
      variants: [],
      info: "English rock band formed in 1967.",
    },
  ],
};

// Initial blocks for the editor
const initialBlocks = [
  "David Byrne is the lead singer of Talking Heads.",
  "Brian Eno is a renowned music producer and artist.",
  "Phil Collins is the drummer and singer of Genesis.",
  "Kate Bush is an influential British singer-songwriter.",
];

// Plugin to initialize the editor with content
function InitialContentPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Initialize the editor with content once on mount
    setTimeout(() => {
      editor.update(() => {
        const root = $getRoot();

        // Clear any existing content
        root.clear();

        // Add initial blocks
        initialBlocks.forEach((text) => {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(text));
          root.append(paragraph);
        });
      });

      console.log("Added initial content to editor");
    }, 100); // Small delay to ensure editor is ready
  }, [editor]);

  return null;
}

// Plugin to handle entity hover and click
function EntityInteractionPlugin() {
  const [editor] = useLexicalComposerContext();
  const [hoveredEntity, setHoveredEntity] = useState<{
    name: string;
    info: string;
    type: string;
  } | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [relatedBlocks, setRelatedBlocks] = useState<{ textContent: string }[]>(
    []
  );

  useEffect(() => {
    // Get the editor element
    const editorElement = editor.getRootElement();
    if (!editorElement) return;

    // Handle mouse over events on entities
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.classList.contains("entity")) {
        const entityName = target.dataset.name || "";
        const entityInfo = target.dataset.info || "";
        const entityType = target.dataset.entity || "";

        setHoveredEntity({
          name: entityName,
          info: entityInfo,
          type: entityType,
        });

        setHoverPosition({
          x: e.pageX,
          y: e.pageY,
        });

        // Find related blocks that mention this entity
        editor.getEditorState().read(() => {
          const root = $getRoot();
          const paragraphs = root.getChildren();
          const mentioningBlocks: { textContent: string }[] = [];

          // Check each paragraph for mentions of this entity
          paragraphs.forEach((paragraph) => {
            const text = paragraph.getTextContent();

            // If the paragraph contains the entity name and is not the current paragraph
            if (
              text.includes(entityName) &&
              text !== (target.closest(".block") as HTMLElement)?.textContent
            ) {
              mentioningBlocks.push({ textContent: text });
            }
          });

          setRelatedBlocks(mentioningBlocks);
        });
      }
    };

    // Handle mouse out events on entities
    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.classList.contains("entity")) {
        setHoveredEntity(null);
      }
    };

    // Handle click events on entities
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.classList.contains("entity")) {
        // Prevent default to avoid text selection
        e.preventDefault();

        // We could implement additional functionality here
        // such as opening a detailed view of the entity
        console.log("Entity clicked:", target.dataset.name);
      }
    };

    // Add event listeners
    editorElement.addEventListener("mouseover", handleMouseOver);
    editorElement.addEventListener("mouseout", handleMouseOut);
    editorElement.addEventListener("click", handleClick);

    // Clean up event listeners
    return () => {
      editorElement.removeEventListener("mouseover", handleMouseOver);
      editorElement.removeEventListener("mouseout", handleMouseOut);
      editorElement.removeEventListener("click", handleClick);
    };
  }, [editor]);

  // Render the preview card when an entity is hovered
  return hoveredEntity ? (
    <PreviewCard
      entity={hoveredEntity}
      position={hoverPosition}
      relatedBlocks={relatedBlocks}
    />
  ) : null;
}

// Main Editor component
export function Editor() {
  const initialConfig = {
    namespace: "BlockEditor",
    theme: {
      paragraph: "block",
      text: {
        bold: "editor-text-bold",
        italic: "editor-text-italic",
        underline: "editor-text-underline",
      },
      // Define the entity theme class explicitly
      entity: "entity",
    },
    onError: (error: Error) => console.error(error),
    nodes: [EntityNode], // Register our custom EntityNode
  };

  return (
    <div className="editor-container">
      <h1>Block-Based Editor Prototype</h1>
      <p>
        Type in the blocks below. Press Enter to create a new block. Use arrow
        keys to navigate between blocks.
      </p>

      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={
              <div className="editor-placeholder">Start typing...</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <InitialContentPlugin />
          <EntityDetectionPlugin entityData={entityData} />
          <HistoryPlugin />
          <EntityInteractionPlugin />
        </div>
      </LexicalComposer>
    </div>
  );
}
