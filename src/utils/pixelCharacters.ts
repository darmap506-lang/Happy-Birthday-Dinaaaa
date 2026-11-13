export type AppStage = 'envelope' | 'card';

export type CharacterPlacement = 'bottom-left' | 'bottom-right' | 'cake-left' | 'cake-right';

export type CatAnimationMode = 'idle' | 'wind-fly' | 'walk-in';

export interface CharacterSceneState {
  /** Whether the corner characters (Page 1 & Page 2) should render */
  showCornerCharacters: boolean;
  /** Whether the cake-side characters (Page 3 & Page 4) should render */
  showCakeCharacters: boolean;
  pandaPlacement: CharacterPlacement;
  catPlacement: CharacterPlacement;
  catMode: CatAnimationMode;
}

export interface CharacterStateInput {
  stage: AppStage;
  isSurpriseOpen: boolean;
  isBlowing: boolean;
  candlesBlown: boolean;
}

/**
 * Pure state machine mapping app screens (Page 1-4) to pixel panda & orange cat
 * placements and animation modes:
 * - Page 1 (envelope) & Page 2 (main card): panda bottom-left, cat bottom-right
 * - Page 3 (modal, candles lit): panda left of cake, cat right of cake; cat flies when blowing
 * - Page 4 (modal, photo slides): panda left of cake, cat walks in from right to stand right of cake
 */
export function getCharacterSceneState({
  isSurpriseOpen,
  isBlowing,
  candlesBlown,
}: CharacterStateInput): CharacterSceneState {
  if (!isSurpriseOpen) {
    return {
      showCornerCharacters: true,
      showCakeCharacters: false,
      pandaPlacement: 'bottom-left',
      catPlacement: 'bottom-right',
      catMode: 'idle',
    };
  }

  let catMode: CatAnimationMode = 'idle';
  if (isBlowing && !candlesBlown) {
    catMode = 'wind-fly';
  } else if (candlesBlown) {
    catMode = 'walk-in';
  }

  return {
    showCornerCharacters: false,
    showCakeCharacters: true,
    pandaPlacement: 'cake-left',
    catPlacement: 'cake-right',
    catMode,
  };
}
