import { Fragment } from "react";

/** Small editorial format: no HTML execution, embeds or arbitrary URL schemes. */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong>
      : part.startsWith("*") && part.endsWith("*") ? <em key={index}>{part.slice(1, -1)}</em>
        : <Fragment key={index}>{part}</Fragment>,
  );
}

export function ExploreStoryContent({ text }: { text: string }) {
  return <>{text.replace(/\r\n/g, "\n").split(/\n\s*\n/).filter(Boolean).map((block, index) => {
    const image = block.trim().match(/^!\[([^\]]*)\]\(([^\s)]+)\)$/);
    if (image) {
      const [, alt, url] = image;
      if (!/^https:\/\//i.test(url) && !/^\/(?!\/)/.test(url)) return <p key={index}>{block}</p>;
      return <figure key={index}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} loading="lazy" />
        {alt ? <figcaption>{alt}</figcaption> : null}
      </figure>;
    }
    if (block.startsWith("## ")) return <h3 key={index}>{inline(block.slice(3))}</h3>;
    if (block.startsWith("> ")) return <blockquote key={index}>{inline(block.slice(2))}</blockquote>;
    return <p key={index}>{inline(block)}</p>;
  })}</>;
}
