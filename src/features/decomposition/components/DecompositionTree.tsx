import { cn } from "../../../lib/utils";
import styles from "../DecompositionPage.module.css";
import type { DecompositionNode } from "../types";

export const parseRadicalMeaning = (meaningVi: string | null, isRadicalOrVariant: boolean) => {
  if (!meaningVi) return { radicalName: "", cleanMeaning: "" };
  if (isRadicalOrVariant && meaningVi.includes(":")) {
    const colonIndex = meaningVi.indexOf(":");
    let radicalName = meaningVi.substring(0, colonIndex).trim();
    const cleanMeaning = meaningVi.substring(colonIndex + 1).trim();
    if (radicalName.startsWith("Biến thể của bộ ")) {
      radicalName = radicalName.replace("Biến thể của bộ ", "").trim();
    }
    return { radicalName, cleanMeaning };
  }
  return { radicalName: "", cleanMeaning: meaningVi };
};

interface DecompositionTreeNodeProps {
  node: DecompositionNode;
  selectedNode: DecompositionNode | null;
  onSelectNode: (node: DecompositionNode) => void;
}

export function DecompositionTreeNode({
  node,
  selectedNode,
  onSelectNode,
}: DecompositionTreeNodeProps) {
  const isSelected = selectedNode?.character === node.character;
  const isRootRadical = node.display_type === "Bộ thủ gốc";
  const isVariant = node.type === "variant";
  const { radicalName } = parseRadicalMeaning(node.meaning_vi, isRootRadical || isVariant);
  const badgeText = (isRootRadical || isVariant) ? radicalName : "";

  const isSpecial = node.type === "special";

  // If it's a special component without display, we skip rendering its box 
  // and directly render its children (flatten the tree).
  if (isSpecial) {
    if (!node.children || node.children.length === 0) return null;
    return (
      <>
        {node.children.map((child, index) => (
          <DecompositionTreeNode
            key={`${child.character}-${child.type}-${index}`}
            node={child}
            selectedNode={selectedNode}
            onSelectNode={onSelectNode}
          />
        ))}
      </>
    );
  }

  return (
    <li className="flex flex-col items-center">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode(node);
        }}
        className={cn(
          "relative border rounded-2xl px-6 py-4 flex flex-col items-center min-w-[125px] transition-all duration-300 z-10 cursor-pointer select-none",
          "backdrop-blur-md shadow-2xs hover:-translate-y-1 hover:scale-105 hover:shadow-md",
          
          // Color-coded gradients based on node type
          node.type === "composite" && [
            "bg-gradient-to-br from-white to-blue-50/15 dark:from-zinc-900 dark:to-blue-950/10",
            "border-blue-500/20 dark:border-blue-500/15",
            "hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)]"
          ],
          (node.type === "basic" || node.type === "variant") && [
            "bg-gradient-to-br from-white to-emerald-50/15 dark:from-zinc-900 dark:to-emerald-950/10",
            "border-emerald-500/20 dark:border-emerald-500/15",
            "hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-[0_8px_30px_rgba(16,185,129,0.08)]"
          ],
          node.type === "circular" && [
            "bg-gradient-to-br from-white to-rose-50/15 dark:from-zinc-900 dark:to-rose-950/10",
            "border-rose-500/20 dark:border-rose-500/15",
            "hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-[0_8px_30px_rgba(244,63,94,0.08)]"
          ],
          
          // Selection styles
          isSelected
            ? "border-cyan-500 dark:border-cyan-400 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 dark:from-cyan-950/30 dark:to-cyan-950/15 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/20 dark:ring-cyan-400/25 shadow-[0_0_20px_rgba(6,182,212,0.15)] dark:shadow-[0_0_25px_rgba(34,211,238,0.2)] font-semibold -translate-y-1 scale-105"
            : "text-zinc-700 dark:text-zinc-300"
        )}
      >
        {/* Radical badge in the corner */}
        {badgeText && (
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-fuchsia-500/10 dark:bg-fuchsia-950/80 text-fuchsia-600 dark:text-fuchsia-300 rounded-full border border-fuchsia-200/50 dark:border-fuchsia-900/40 shadow-3xs whitespace-nowrap">
            {badgeText}
          </span>
        )}
        
        <span className="text-5xl font-hanzi font-bold leading-normal text-zinc-900 dark:text-zinc-100 tracking-wide mt-1">
          {node.character}
        </span>
        
        {node.pinyin && (
          <span className="text-[10px] font-bold tracking-widest text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-950/65 px-2.5 py-0.5 rounded-full mt-1.5 border border-cyan-500/10 dark:border-cyan-950/50 shadow-3xs">
            {node.pinyin}
          </span>
        )}
      </button>
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <DecompositionTreeNode
              key={`${child.character}-${child.type}`}
              node={child}
              selectedNode={selectedNode}
              onSelectNode={onSelectNode}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

interface DecompositionTreeProps {
  treeData: DecompositionNode;
  selectedNode: DecompositionNode | null;
  onSelectNode: (node: DecompositionNode) => void;
}

export function DecompositionTree({
  treeData,
  selectedNode,
  onSelectNode,
}: DecompositionTreeProps) {
  return (
    <div className={`${styles.decompTree} flex justify-center py-6 min-w-full`}>
      <ul>
        <DecompositionTreeNode
          node={treeData}
          selectedNode={selectedNode}
          onSelectNode={onSelectNode}
        />
      </ul>
    </div>
  );
}
