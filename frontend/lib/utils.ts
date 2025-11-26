import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Smoothly scrolls to an element by ID
 * @param elementId - The ID of the element to scroll to
 * @param offset - Optional offset in pixels from the top (useful for fixed headers)
 */
export function scrollToElement(elementId: string, offset: number = 0) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with ID "${elementId}" not found`);
    return;
  }

  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
}
