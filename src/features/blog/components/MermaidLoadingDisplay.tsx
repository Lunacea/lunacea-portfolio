type MermaidLoadingDisplayProps = {
  className?: string;
};

/**
 * Mermaidローディング表示用の共通コンポーネント
 */
export default function MermaidLoadingDisplay({ 
  className = '' 
}: MermaidLoadingDisplayProps) {
  return (
    <div className={`text-muted-foreground text-sm text-center py-8 ${className}`}>
      <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
        <span>Mermaid図表をレンダリング中...</span>
      </div>
    </div>
  );
}
