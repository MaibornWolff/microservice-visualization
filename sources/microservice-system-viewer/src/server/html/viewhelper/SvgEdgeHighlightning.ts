const CLASS_NAME: string = 'highlight'
export class SvgEdgeHighlightning {

  static markAsHighlightedHandler(e: MouseEvent) {
    (e.target as HTMLElement).parentElement.classList.add(CLASS_NAME)
  }

  static markAsNotHighlightedHandler(e: MouseEvent) {
    (e.target as HTMLElement).parentElement.classList.remove(CLASS_NAME)
  }
}
