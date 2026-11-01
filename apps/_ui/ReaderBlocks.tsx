import type { Block } from "@/data/posts";
import ui from "./ui.module.css";

/** Renders a post body (the same blocks the /blog pages use) with reading typography. */
export function ReaderBlocks({ blocks }: { blocks: readonly Block[] }) {
    return (
        <div className={ui.reader}>
            {blocks.map((block, i) => {
                switch (block.type) {
                    case "p":
                        return <p key={i}>{block.text}</p>;
                    case "h2":
                        return <h2 key={i}>{block.text}</h2>;
                    case "ul":
                        return (
                            <ul key={i}>
                                {block.items.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        );
                    case "quote":
                        return (
                            <blockquote key={i}>
                                <p>{block.text}</p>
                            </blockquote>
                        );
                }
            })}
        </div>
    );
}
