import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"

export function AudioNodeView({ node }: NodeViewProps) {
  const { src, title } = node.attrs as { src: string; title?: string }

  return (
    <NodeViewWrapper className="my-2">
      <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
        {title && (
          <span className="text-muted-foreground text-sm font-medium">
            {title}
          </span>
        )}
        <audio controls className="h-8 flex-1" preload="metadata">
          <source src={src} />
        </audio>
      </div>
    </NodeViewWrapper>
  )
}
