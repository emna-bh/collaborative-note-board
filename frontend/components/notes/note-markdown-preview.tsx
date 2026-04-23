import ReactMarkdown from 'react-markdown';

type Props = {
  content: string;
};

function shouldShowOverflowIndicator(content: string) {
  return content.trim().length > 180;
}

export function NoteMarkdownPreview({ content }: Props) {
  const showOverflowIndicator = shouldShowOverflowIndicator(content);

  return (
    <div className="relative">
      <div className="max-h-20 overflow-hidden text-sm leading-6 text-slate-700">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h4 className="mb-2 text-base font-semibold text-slate-900">{children}</h4>
            ),
            h2: ({ children }) => (
              <h4 className="mb-2 text-sm font-semibold text-slate-900">{children}</h4>
            ),
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => (
              <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
            ),
            li: ({ children }) => <li>{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="mb-2 border-l-2 border-slate-400/50 pl-3 italic text-slate-600 last:mb-0">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="rounded-md bg-white/75 px-1.5 py-0.5 text-[13px]">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="mb-2 overflow-x-auto rounded-2xl bg-white/75 p-3 text-[13px] last:mb-0">
                {children}
              </pre>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-slate-900">{children}</strong>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {showOverflowIndicator && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.92)_72%)]" />
          <span className="pointer-events-none absolute bottom-0 right-0 text-xs font-medium tracking-[0.08em] text-slate-500">
            (...)
          </span>
        </>
      )}
    </div>
  );
}
