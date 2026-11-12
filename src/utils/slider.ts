/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SlidePhoto {
  id: number;
  url: string;
  title: string;
  caption: string;
}

/**
 * Returns the next cyclic slide index.
 */
export function getNextSlideIndex(currentIndex: number, totalSlides: number): number {
  if (totalSlides <= 0) return 0;
  return (currentIndex + 1) % totalSlides;
}

/**
 * Returns the previous cyclic slide index.
 */
export function getPrevSlideIndex(currentIndex: number, totalSlides: number): number {
  if (totalSlides <= 0) return 0;
  return (currentIndex - 1 + totalSlides) % totalSlides;
}
