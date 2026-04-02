import { Fragment } from "react";
import type { Item } from "../../../../game/engine";
import { getItemEffectTokens } from "./utils";
import "./EffectText.css";

export function EffectText({
  item,
  className,
}: {
  item: Item;
  className: string;
}) {
  const tokens = getItemEffectTokens(item);
  if (tokens.length === 0) return null;

  return (
    <span className={className}>
      {tokens.map((token, index) => (
        <Fragment key={`${token.text}-${index}`}>
          {index > 0 && <span className="eq-effect-sep"> · </span>}
          <span className={`eq-effect-token eq-effect-token--${token.tone}`}>
            {token.text}
          </span>
        </Fragment>
      ))}
    </span>
  );
}
