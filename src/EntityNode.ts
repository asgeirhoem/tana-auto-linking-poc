import {
  $applyNodeReplacement,
  EditorConfig,
  LexicalNode,
  SerializedTextNode,
  TextNode,
  $createTextNode,
  $isRangeSelection,
  $getSelection,
  COMMAND_PRIORITY_EDITOR,
  KEY_ARROW_RIGHT_COMMAND,
  createCommand,
} from "lexical";

// Define the serialized version of our node for persistence
export type SerializedEntityNode = SerializedTextNode & {
  type: "entity";
  entityType: string;
  entityName: string;
  entityInfo: string;
};

// Command to insert a space after an entity
export const INSERT_SPACE_AFTER_ENTITY_COMMAND = createCommand(
  "INSERT_SPACE_AFTER_ENTITY"
);

// Our custom EntityNode extends TextNode
export class EntityNode extends TextNode {
  __entityType: string;
  __entityName: string;
  __entityInfo: string;

  static getType(): string {
    return "entity";
  }

  static clone(node: EntityNode): EntityNode {
    return new EntityNode(
      node.__text,
      node.__entityType,
      node.__entityName,
      node.__entityInfo
    );
  }

  constructor(
    text: string,
    entityType: string,
    entityName: string,
    entityInfo: string
  ) {
    super(text);
    this.__entityType = entityType;
    this.__entityName = entityName;
    this.__entityInfo = entityInfo;
  }

  // Create the DOM element for this node
  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);

    // Apply entity styling with extremely prominent colors
    dom.style.backgroundColor = "#ff0"; // Pure yellow
    dom.style.border = "3px solid #f90"; // Thicker orange border all around
    dom.style.padding = "2px 4px"; // More padding
    dom.style.margin = "0 2px"; // Add margin
    dom.style.borderRadius = "4px"; // Larger border radius
    dom.style.cursor = "pointer";
    dom.style.fontWeight = "bold"; // Make text bold
    dom.style.color = "#000"; // Ensure text is black for contrast
    dom.style.display = "inline-block"; // Make it a block element
    dom.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)"; // Add stronger shadow
    dom.style.position = "relative"; // For z-index to work
    dom.style.zIndex = "1"; // Ensure it's above other content
    dom.style.textDecoration = "none"; // Remove any text decoration

    // Add entity class
    dom.classList.add("entity");

    // Add data attributes for entity information
    dom.dataset.entity = this.__entityType;
    dom.dataset.name = this.__entityName;
    dom.dataset.info = this.__entityInfo;

    // Add inline CSS to ensure styles are applied
    const styleTag = document.createElement("style");
    styleTag.textContent = `
      .entity {
        background-color: #ff0 !important;
        border: 3px solid #f90 !important;
        padding: 2px 4px !important;
        margin: 0 2px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-weight: bold !important;
        color: #000 !important;
        display: inline-block !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
        position: relative !important;
        z-index: 1 !important;
        text-decoration: none !important;
      }
    `;
    document.head.appendChild(styleTag);

    return dom;
  }

  // Override key handling to insert space after entity when at the end
  insertNewAfter(selection: any, restoreSelection = true): TextNode {
    // Create a space node with two spaces to ensure visibility
    const spaceNode = $createTextNode("  ");

    // Insert it after this entity node
    this.insertAfter(spaceNode);

    // Move selection to after the first space
    if (restoreSelection) {
      spaceNode.select(1, 1);

      // Force focus on the editor
      setTimeout(() => {
        const editorElement = document.querySelector("[contenteditable=true]");
        if (editorElement) {
          (editorElement as HTMLElement).focus();
        }
      }, 0);
    }

    return spaceNode;
  }

  // Required for serialization
  exportJSON(): SerializedEntityNode {
    return {
      ...super.exportJSON(),
      type: "entity",
      entityType: this.__entityType,
      entityName: this.__entityName,
      entityInfo: this.__entityInfo,
    };
  }

  // Required for deserialization
  static importJSON(serializedNode: SerializedEntityNode): EntityNode {
    const node = $createEntityNode(
      serializedNode.text,
      serializedNode.entityType,
      serializedNode.entityName,
      serializedNode.entityInfo
    );

    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);

    return node;
  }

  // Helper methods
  getEntityType(): string {
    return this.__entityType;
  }

  getEntityName(): string {
    return this.__entityName;
  }

  getEntityInfo(): string {
    return this.__entityInfo;
  }

  isEntity(): boolean {
    return true;
  }
}

// Helper function to create an EntityNode
export function $createEntityNode(
  text: string,
  entityType: string,
  entityName: string,
  entityInfo: string
): EntityNode {
  return $applyNodeReplacement(
    new EntityNode(text, entityType, entityName, entityInfo)
  );
}

// Helper function to check if a node is an EntityNode
export function $isEntityNode(
  node: LexicalNode | null | undefined
): node is EntityNode {
  return node instanceof EntityNode;
}
