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
import { EntityKeyPlugin } from "./EntityKeyPlugin";
import { PreviewCard } from "./PreviewCard";

// Entity data for demonstration
const entityData = {
  people: [
    {
      name: "David Byrne",
      variants: ["Byrne", "David", "D. Byrne", "D.B."],
      info: "Lead singer of Talking Heads.",
    },
    {
      name: "Brian Eno",
      variants: ["Eno", "Brian", "B. Eno", "B.E."],
      info: "Renowned music producer and artist.",
    },
    {
      name: "Phil Collins",
      variants: ["Collins", "Phil", "P. Collins", "P.C."],
      info: "Drummer and singer of Genesis.",
    },
    {
      name: "Kate Bush",
      variants: ["Bush", "Kate", "K. Bush", "K.B."],
      info: "Influential British singer-songwriter.",
    },
    {
      name: "Tina Weymouth",
      variants: ["Weymouth", "Tina", "T. Weymouth", "T.W."],
      info: "Bassist of Talking Heads.",
    },
    {
      name: "Jerry Harrison",
      variants: ["Harrison", "Jerry", "J. Harrison", "J.H."],
      info: "Guitarist and keyboardist of Talking Heads.",
    },
    {
      name: "Chris Frantz",
      variants: ["Frantz", "Chris", "C. Frantz", "C.F."],
      info: "Drummer of Talking Heads.",
    },
    {
      name: "Peter Gabriel",
      variants: ["Gabriel", "Peter", "P. Gabriel", "P.G."],
      info: "Original lead vocalist of Genesis.",
    },
    {
      name: "Tony Banks",
      variants: ["Banks", "Tony", "T. Banks", "T.B."],
      info: "Keyboardist of Genesis.",
    },
    {
      name: "Mike Rutherford",
      variants: ["Rutherford", "Mike", "M. Rutherford", "M.R."],
      info: "Guitarist and bassist of Genesis.",
    },
    // Additional people
    {
      name: "Freddie Mercury",
      variants: ["Mercury", "Freddie", "Fred", "F. Mercury", "F.M."],
      info: "Lead vocalist of Queen.",
    },
    {
      name: "David Bowie",
      variants: ["Bowie", "David", "D. Bowie", "D.B.", "Ziggy Stardust"],
      info: "Influential British musician and actor.",
    },
    {
      name: "Mick Jagger",
      variants: ["Jagger", "Mick", "M. Jagger", "M.J."],
      info: "Lead vocalist of The Rolling Stones.",
    },
    {
      name: "John Lennon",
      variants: ["Lennon", "John", "J. Lennon", "J.L."],
      info: "Co-founder of The Beatles.",
    },
    {
      name: "Paul McCartney",
      variants: ["McCartney", "Paul", "P. McCartney", "P.M.", "Macca"],
      info: "Co-founder of The Beatles.",
    },
    {
      name: "George Harrison",
      variants: ["Harrison", "George", "G. Harrison", "G.H."],
      info: "Lead guitarist of The Beatles.",
    },
    {
      name: "Ringo Starr",
      variants: ["Starr", "Ringo", "R. Starr", "R.S.", "Richard Starkey"],
      info: "Drummer of The Beatles.",
    },
    {
      name: "Bob Dylan",
      variants: ["Dylan", "Bob", "B. Dylan", "B.D.", "Robert Zimmerman"],
      info: "American singer-songwriter.",
    },
    {
      name: "Joni Mitchell",
      variants: ["Mitchell", "Joni", "J. Mitchell", "J.M."],
      info: "Canadian singer-songwriter.",
    },
    {
      name: "Neil Young",
      variants: ["Young", "Neil", "N. Young", "N.Y."],
      info: "Canadian-American singer-songwriter.",
    },
  ],
  organizations: [
    {
      name: "Talking Heads",
      variants: ["The Talking Heads", "TH", "Heads"],
      info: "American rock band formed in 1975.",
    },
    {
      name: "Genesis",
      variants: ["The Genesis", "Gen"],
      info: "English rock band formed in 1967.",
    },
    {
      name: "Roxy Music",
      variants: ["The Roxy Music", "RM"],
      info: "English rock band formed in 1970.",
    },
    {
      name: "Warp Records",
      variants: ["Warp", "WR"],
      info: "British independent record label.",
    },
    {
      name: "EMI",
      variants: ["EMI Records", "Electric and Musical Industries"],
      info: "British multinational music recording and publishing company.",
    },
    // Additional organizations
    {
      name: "The Beatles",
      variants: ["Beatles", "The Fab Four", "Fab Four"],
      info: "English rock band formed in Liverpool in 1960.",
    },
    {
      name: "The Rolling Stones",
      variants: ["Rolling Stones", "The Stones", "Stones"],
      info: "English rock band formed in London in 1962.",
    },
    {
      name: "Queen",
      variants: ["The Queen", "Queen Band"],
      info: "British rock band formed in London in 1970.",
    },
    {
      name: "Pink Floyd",
      variants: ["The Pink Floyd", "Floyd"],
      info: "English rock band formed in London in 1965.",
    },
    {
      name: "Led Zeppelin",
      variants: ["Zeppelin", "Zep", "The Zep"],
      info: "English rock band formed in London in 1968.",
    },
    {
      name: "The Who",
      variants: ["Who", "The Who Band"],
      info: "English rock band formed in London in 1964.",
    },
    {
      name: "The Clash",
      variants: ["Clash", "The Clash Band"],
      info: "English punk rock band formed in London in 1976.",
    },
    {
      name: "The Smiths",
      variants: ["Smiths", "The Smiths Band"],
      info: "English rock band formed in Manchester in 1982.",
    },
    {
      name: "Radiohead",
      variants: ["The Radiohead", "Radiohead Band"],
      info: "English rock band formed in Abingdon in 1985.",
    },
    {
      name: "Nirvana",
      variants: ["The Nirvana", "Nirvana Band"],
      info: "American rock band formed in Aberdeen, Washington in 1987.",
    },
  ],
  places: [
    {
      name: "New York City",
      variants: ["NYC", "New York", "The Big Apple", "NY"],
      info: "Largest city in the United States.",
    },
    {
      name: "London",
      variants: ["LDN", "The Big Smoke", "The Square Mile"],
      info: "Capital city of the United Kingdom.",
    },
    {
      name: "CBGB",
      variants: ["CBGB & OMFUG", "Country, BlueGrass, and Blues"],
      info: "Former New York City music club where many bands got their start.",
    },
    // Additional places
    {
      name: "Liverpool",
      variants: ["The Pool", "Scouse", "Merseyside"],
      info: "City in England, birthplace of The Beatles.",
    },
    {
      name: "Manchester",
      variants: ["Manc", "Mancunian", "Cottonopolis"],
      info: "City in England, known for its music scene.",
    },
    {
      name: "Los Angeles",
      variants: ["LA", "L.A.", "City of Angels", "Hollywood"],
      info: "Second-largest city in the United States.",
    },
    {
      name: "San Francisco",
      variants: ["SF", "The City", "Frisco", "San Fran"],
      info: "City in California, known for its music scene.",
    },
    {
      name: "Seattle",
      variants: ["The Emerald City", "Rain City", "Jet City"],
      info: "City in Washington, birthplace of grunge music.",
    },
    {
      name: "Nashville",
      variants: ["Music City", "Athens of the South", "Nash"],
      info: "Capital city of Tennessee, known for country music.",
    },
    {
      name: "Memphis",
      variants: [
        "Bluff City",
        "Home of the Blues",
        "Birthplace of Rock and Roll",
      ],
      info: "City in Tennessee, known for blues and rock and roll.",
    },
    {
      name: "Detroit",
      variants: ["Motor City", "Motown", "The D"],
      info: "City in Michigan, known for Motown music.",
    },
    {
      name: "Chicago",
      variants: ["The Windy City", "Chi-Town", "Second City"],
      info: "City in Illinois, known for blues and jazz.",
    },
    {
      name: "New Orleans",
      variants: ["NOLA", "The Big Easy", "Crescent City"],
      info: "City in Louisiana, known for jazz and blues.",
    },
  ],
};

// Initial blocks for the editor
const initialBlocks = [
  "David Byrne is the lead singer of Talking Heads.",
  "Brian Eno is a renowned music producer and artist.",
  "Phil Collins is the drummer and singer of Genesis.",
  "Kate Bush is an influential British singer-songwriter.",
  "Freddie Mercury was the lead singer of Queen.",
  "The Beatles were formed in Liverpool in the 1960s.",
  "Mick Jagger is the frontman of The Rolling Stones.",
  "Bob Dylan is known for his poetic lyrics.",
  "Pink Floyd is one of the most influential rock bands.",
  "New York City and London are major music hubs.",
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
          <EntityKeyPlugin />
          <HistoryPlugin />
          <EntityInteractionPlugin />
        </div>
      </LexicalComposer>
    </div>
  );
}
