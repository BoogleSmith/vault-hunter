import { type Game } from "../../../../game/engine";
import { type LocalMapRow, getLocalTileViewModel } from "./exploreMapUtils";
import "./LocalMapView.css";

interface LocalMapViewProps {
  game: Game;
  localRows: LocalMapRow[];
  showEnemyDebug: boolean;
}

export function LocalMapView({
  game,
  localRows,
  showEnemyDebug,
}: LocalMapViewProps) {
  return (
    <div className="map-column">
      <div className="map map--local" role="region" aria-label="Nearby map">
        {localRows.map((row, rowIdx) => (
          <div className="map-row map-row--local" key={`local-${rowIdx}`}>
            {row.map(({ room, x, y }) => {
              const tile = getLocalTileViewModel({
                room,
                x,
                y,
                game,
                showEnemyDebug,
              });

              return (
                <div className={tile.className} key={`local-${x}-${y}`}>
                  {room && tile.isVisible ? (
                    <>
                      <span className="tile-symbol" aria-hidden="true">
                        {tile.symbol}
                      </span>
                      <span className="tile-name">{tile.name}</span>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
