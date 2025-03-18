import React from "react";

interface Entity {
  name: string;
  info: string;
  type: string;
}

interface Position {
  x: number;
  y: number;
}

interface RelatedBlock {
  textContent: string;
}

interface PreviewCardProps {
  entity: Entity | null;
  position: Position;
  relatedBlocks: RelatedBlock[];
}

export function PreviewCard({
  entity,
  position,
  relatedBlocks,
}: PreviewCardProps) {
  if (!entity) return null;

  // Use inline styles to ensure the preview card is visible
  const cardStyle = {
    position: "absolute" as const,
    left: `${position.x + 10}px`,
    top: `${position.y + 10}px`,
    display: "block",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    maxWidth: "300px",
    zIndex: 1000,
    fontSize: "14px",
  };

  const headingStyle = {
    marginTop: 0,
    marginBottom: "8px",
    fontSize: "16px",
    borderBottom: "1px solid #eee",
    paddingBottom: "5px",
  };

  const relatedBlocksStyle = {
    marginTop: "10px",
    maxHeight: "200px",
    overflowY: "auto" as const,
  };

  const relatedBlockStyle = {
    padding: "5px",
    borderLeft: "3px solid #ddd",
    marginBottom: "5px",
    backgroundColor: "#f9f9f9",
  };

  return (
    <div style={cardStyle}>
      <h4 style={headingStyle}>{entity.name}</h4>
      <div>{entity.info}</div>
      {relatedBlocks.length > 0 && (
        <div style={relatedBlocksStyle}>
          <h4 style={headingStyle}>
            Mentioned in {relatedBlocks.length} block
            {relatedBlocks.length > 1 ? "s" : ""}
          </h4>
          {relatedBlocks.map((block, i) => (
            <div key={i} style={relatedBlockStyle}>
              {block.textContent}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
