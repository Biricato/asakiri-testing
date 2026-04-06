import { View, Text, Image } from "react-native"

type TipTapNode = {
  type: string
  content?: TipTapNode[]
  text?: string
  attrs?: Record<string, any>
  marks?: { type: string; attrs?: Record<string, any> }[]
}

export function renderTipTap(node: any, colors: { foreground: string; muted: string; border: string; surface: string }): React.ReactNode {
  if (!node) return null
  if (typeof node === "string") return <Text style={{ color: colors.foreground }}>{node}</Text>

  const doc = node as TipTapNode

  if (doc.type === "doc" && doc.content) {
    return doc.content.map((child, i) => (
      <View key={i}>{renderNode(child, colors)}</View>
    ))
  }

  return renderNode(doc, colors)
}

function renderNode(node: TipTapNode, colors: { foreground: string; muted: string; border: string; surface: string }): React.ReactNode {
  switch (node.type) {
    case "paragraph":
      if (!node.content || node.content.length === 0) {
        // Empty paragraph = line break
        return <View style={{ height: 16 }} />
      }
      return (
        <Text style={{ fontSize: 16, lineHeight: 26, color: colors.foreground, marginBottom: 14 }}>
          {node.content.map((child, i) => renderInline(child, colors, i))}
        </Text>
      )

    case "heading": {
      const level = node.attrs?.level ?? 2
      const size = level === 1 ? 24 : level === 2 ? 20 : 18
      return (
        <Text style={{ fontSize: size, fontWeight: "bold", color: colors.foreground, marginBottom: 8, marginTop: 16 }}>
          {node.content?.map((child, i) => renderInline(child, colors, i))}
        </Text>
      )
    }

    case "bulletList":
      return (
        <View style={{ marginBottom: 12 }}>
          {node.content?.map((item, i) => (
            <View key={i} style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ fontSize: 16, color: colors.foreground, marginRight: 8 }}>•</Text>
              <View style={{ flex: 1 }}>
                {item.content?.map((child, j) => (
                  <View key={j}>{renderNode(child, colors)}</View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )

    case "orderedList":
      return (
        <View style={{ marginBottom: 12 }}>
          {node.content?.map((item, i) => (
            <View key={i} style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ fontSize: 16, color: colors.foreground, marginRight: 8, minWidth: 20 }}>{i + 1}.</Text>
              <View style={{ flex: 1 }}>
                {item.content?.map((child, j) => (
                  <View key={j}>{renderNode(child, colors)}</View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )

    case "listItem":
      return node.content?.map((child, i) => (
        <View key={i}>{renderNode(child, colors)}</View>
      ))

    case "blockquote":
      return (
        <View style={{ borderLeftWidth: 3, borderLeftColor: colors.border, paddingLeft: 12, marginBottom: 12 }}>
          {node.content?.map((child, i) => (
            <View key={i}>{renderNode(child, colors)}</View>
          ))}
        </View>
      )

    case "codeBlock":
      return (
        <View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <Text style={{ fontFamily: "monospace", fontSize: 14, color: colors.foreground }}>
            {node.content?.map((child) => child.text ?? "").join("")}
          </Text>
        </View>
      )

    case "image":
      return node.attrs?.src ? (
        <Image
          source={{ uri: node.attrs.src }}
          style={{ width: "100%", height: 200, borderRadius: 8, marginBottom: 12 }}
          resizeMode="cover"
        />
      ) : null

    case "hardBreak":
      return <Text>{"\n"}</Text>

    case "horizontalRule":
      return <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />

    case "table":
      return (
        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginBottom: 12, overflow: "hidden" }}>
          {node.content?.map((row, i) => (
            <View key={i} style={{ flexDirection: "row", borderBottomWidth: i < (node.content?.length ?? 1) - 1 ? 1 : 0, borderBottomColor: colors.border }}>
              {row.content?.map((cell, j) => (
                <View key={j} style={{ flex: 1, padding: 8, borderRightWidth: j < (row.content?.length ?? 1) - 1 ? 1 : 0, borderRightColor: colors.border }}>
                  {cell.content?.map((child, k) => (
                    <View key={k}>{renderNode(child, colors)}</View>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
      )

    case "text":
      return renderInline(node, colors, 0)

    default:
      // Unknown node type — try to render children
      if (node.content) {
        return node.content.map((child, i) => (
          <View key={i}>{renderNode(child, colors)}</View>
        ))
      }
      return null
  }
}

function renderInline(node: TipTapNode, colors: { foreground: string; muted: string }, key: number): React.ReactNode {
  if (node.type === "hardBreak") return <Text key={key}>{"\n"}</Text>
  if (node.type !== "text" || !node.text) return null

  let style: any = { fontSize: 16, lineHeight: 26, color: colors.foreground }

  if (node.marks) {
    for (const mark of node.marks) {
      switch (mark.type) {
        case "bold":
          style.fontWeight = "bold"
          break
        case "italic":
          style.fontStyle = "italic"
          break
        case "underline":
          style.textDecorationLine = "underline"
          break
        case "strike":
          style.textDecorationLine = "line-through"
          break
        case "code":
          style.fontFamily = "monospace"
          style.backgroundColor = colors.muted + "20"
          style.fontSize = 14
          break
        case "link":
          style.color = "#17c964"
          style.textDecorationLine = "underline"
          break
      }
    }
  }

  return <Text key={key} style={style}>{node.text}</Text>
}
