import { useState, useMemo, type CSSProperties, type ChangeEvent } from "react";

export interface ScoreGroup {
  id: string;
  name: string;
  score: number;
  color: string;
}

export const GROUP_PALETTE = [
  "#ef4444", // 1: Red // lint-ignore
  "#0284c7", // 2: Blue // lint-ignore
  "#10b981", // 3: Emerald // lint-ignore
  "#f59e0b", // 4: Amber // lint-ignore
  "#8b5cf6", // 5: Purple // lint-ignore
  "#ec4899", // 6: Pink // lint-ignore
  "#06b6d4", // 7: Cyan // lint-ignore
  "#f97316", // 8: Orange // lint-ignore
];

export const DEFAULT_INITIAL_GROUPS: ScoreGroup[] = [
  { id: "g-1", name: "1모둠", score: 0, color: GROUP_PALETTE[0] ?? "#3b82f6" },
  { id: "g-2", name: "2모둠", score: 0, color: GROUP_PALETTE[1] ?? "#10b981" },
  { id: "g-3", name: "3모둠", score: 0, color: GROUP_PALETTE[2] ?? "#f59e0b" },
  { id: "g-4", name: "4모둠", score: 0, color: GROUP_PALETTE[3] ?? "#ef4444" },
];

export interface GroupScoreBoardProps {
  /** Initial group state (defaults to 4 groups) */
  initialGroups?: ScoreGroup[];
  /** Minimum number of groups allowed (default: 1) */
  minGroups?: number;
  /** Maximum number of groups allowed (default: 8) */
  maxGroups?: number;
  /** Callback fired whenever groups or scores change */
  onScoreChange?: (groups: ScoreGroup[]) => void;
  className?: string;
  style?: CSSProperties;
}

export function GroupScoreBoard({
  initialGroups = DEFAULT_INITIAL_GROUPS,
  minGroups = 1,
  maxGroups = 8,
  onScoreChange,
  className = "",
  style,
}: GroupScoreBoardProps) {
  const [groups, setGroups] = useState<ScoreGroup[]>(initialGroups);

  // Highest score calculation (must be > 0 to have a winner)
  const maxScore = useMemo(() => {
    if (groups.length === 0) return 0;
    return Math.max(...groups.map((g) => g.score));
  }, [groups]);

  const updateGroups = (newGroups: ScoreGroup[]) => {
    setGroups(newGroups);
    onScoreChange?.(newGroups);
  };

  const handleScoreDelta = (id: string, delta: number) => {
    const updated = groups.map((g) => {
      if (g.id === id) {
        return { ...g, score: Math.max(0, g.score + delta) };
      }
      return g;
    });
    updateGroups(updated);
  };

  const handleResetGroupScore = (id: string) => {
    const updated = groups.map((g) => {
      if (g.id === id) {
        return { ...g, score: 0 };
      }
      return g;
    });
    updateGroups(updated);
  };

  const handleResetAllScores = () => {
    const updated = groups.map((g) => ({ ...g, score: 0 }));
    updateGroups(updated);
  };

  const handleAddGroup = () => {
    if (groups.length >= maxGroups) return;
    const nextIdx = groups.length;
    const nextColor = GROUP_PALETTE[nextIdx % GROUP_PALETTE.length] ?? "#3b82f6";
    const newGroup: ScoreGroup = {
      id: `g-${Date.now()}-${nextIdx + 1}`,
      name: `${nextIdx + 1}모둠`,
      score: 0,
      color: nextColor,
    };
    updateGroups([...groups, newGroup]);
  };

  const handleRemoveGroup = (id: string) => {
    if (groups.length <= minGroups) return;
    updateGroups(groups.filter((g) => g.id !== id));
  };

  const handleNameChange = (id: string, newName: string) => {
    const updated = groups.map((g) => {
      if (g.id === id) {
        return { ...g, name: newName };
      }
      return g;
    });
    updateGroups(updated);
  };

  return (
    <div
      className={`oe-scoreboard ${className}`}
      style={style}
      data-testid="group-scoreboard"
    >
      {/* Header with Title and Global Actions */}
      <div className="oe-scoreboard__header">
        <div className="oe-scoreboard__title-group">
          <i className="fi fi-rr-trophy" aria-hidden="true" />
          <h2 className="oe-scoreboard__title">모둠 점수판</h2>
          <span className="oe-scoreboard__count-badge">{groups.length}개 모둠</span>
        </div>

        <div className="oe-scoreboard__global-actions">
          <button
            type="button"
            className="oe-scoreboard__header-btn"
            onClick={handleAddGroup}
            disabled={groups.length >= maxGroups}
            aria-label="모둠 추가"
          >
            <i className="fi fi-rr-plus" aria-hidden="true" />
            <span>모둠 추가</span>
          </button>

          <button
            type="button"
            className="oe-scoreboard__header-btn oe-scoreboard__header-btn--reset"
            onClick={handleResetAllScores}
            aria-label="모든 점수 초기화"
          >
            <i className="fi fi-rr-refresh" aria-hidden="true" />
            <span>점수 초기화</span>
          </button>
        </div>
      </div>

      {/* Grid of Groups */}
      <div
        className="oe-scoreboard__grid"
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
        }}
      >
        {groups.map((group) => {
          const isWinner = maxScore > 0 && group.score === maxScore;

          return (
            <div
              key={group.id}
              className={`oe-scoreboard__card ${isWinner ? "oe-scoreboard__card--winner" : ""}`}
              data-testid={`score-card-${group.name}`}
            >
              {/* Winner Trophy Highlight Badge */}
              {isWinner && (
                <div className="oe-scoreboard__trophy-badge" data-testid="trophy-badge">
                  <i className="fi fi-rr-trophy" aria-hidden="true" />
                  <span>1위</span>
                </div>
              )}

              {/* Group Color Stripe & Delete Option */}
              <div
                className="oe-scoreboard__color-stripe"
                style={{ backgroundColor: group.color }}
              />

              <div className="oe-scoreboard__card-header">
                <input
                  type="text"
                  className="oe-scoreboard__name-input"
                  value={group.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleNameChange(group.id, e.target.value)
                  }
                  aria-label="모둠 이름"
                />

                {groups.length > minGroups && (
                  <button
                    type="button"
                    className="oe-scoreboard__remove-btn"
                    onClick={() => handleRemoveGroup(group.id)}
                    aria-label={`${group.name} 삭제`}
                  >
                    <i className="fi fi-rr-cross-small" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Big Score Display */}
              <div className="oe-scoreboard__score-area">
                <span className="oe-scoreboard__score-digits" data-testid="group-score">
                  {group.score}
                </span>
                <span className="oe-scoreboard__score-unit">점</span>
              </div>

              {/* Quick Score Buttons */}
              <div className="oe-scoreboard__score-actions">
                <button
                  type="button"
                  className="oe-scoreboard__btn-delta oe-scoreboard__btn-delta--pos"
                  onClick={() => handleScoreDelta(group.id, 1)}
                  aria-label={`${group.name} +1점`}
                >
                  +1
                </button>
                <button
                  type="button"
                  className="oe-scoreboard__btn-delta oe-scoreboard__btn-delta--pos-5"
                  onClick={() => handleScoreDelta(group.id, 5)}
                  aria-label={`${group.name} +5점`}
                >
                  +5
                </button>
                <button
                  type="button"
                  className="oe-scoreboard__btn-delta oe-scoreboard__btn-delta--neg"
                  onClick={() => handleScoreDelta(group.id, -1)}
                  disabled={group.score <= 0}
                  aria-label={`${group.name} -1점`}
                >
                  -1
                </button>
              </div>

              {/* Individual Reset */}
              <button
                type="button"
                className="oe-scoreboard__reset-card-btn"
                onClick={() => handleResetGroupScore(group.id)}
                aria-label={`${group.name} 점수 0으로 리셋`}
              >
                <i className="fi fi-rr-refresh" aria-hidden="true" />
                <span>0점 리셋</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
