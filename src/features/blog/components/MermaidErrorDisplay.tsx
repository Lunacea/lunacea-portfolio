import { type MermaidError } from '@/features/blog/hooks/useMermaid';

type MermaidErrorDisplayProps = {
  error: MermaidError;
  className?: string;
};

/**
 * Mermaidエラー表示用の共通コンポーネント
 */
export default function MermaidErrorDisplay({ 
  error, 
  className = '' 
}: MermaidErrorDisplayProps) {
  return (
    <div className={`bg-red-100 border border-red-300 rounded-lg p-4 my-6 ${className}`}>
      <h4 className="text-red-800 font-semibold mb-2">Mermaid図表のレンダリングエラー</h4>
      <p className="text-red-700 text-sm mb-2">エラー: {error.message}</p>
      
      {error.originalContent && (
        <>
          <p className="text-red-700 text-sm mb-2">元の構文：</p>
          <pre className="bg-red-50 p-2 rounded text-xs overflow-x-auto mb-2">
            {error.originalContent}
          </pre>
        </>
      )}
      
      {error.correctedContent && error.correctedContent !== error.originalContent && (
        <>
          <p className="text-red-700 text-sm mb-2">修正後の構文：</p>
          <pre className="bg-red-50 p-2 rounded text-xs overflow-x-auto">
            {error.correctedContent}
          </pre>
        </>
      )}
    </div>
  );
}
