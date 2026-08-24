/**
 * Guards against "Failed to execute 'removeChild'/'insertBefore' on 'Node'" crashes.
 *
 * These NotFoundError exceptions happen when an external agent (browser auto-translate
 * such as Google Translate, or some extensions) rewrites text nodes that React still
 * holds references to. React then tries to remove/insert a node that is no longer a
 * child of the recorded parent and the whole tree unmounts with an error screen.
 *
 * The patch below makes those two operations tolerant instead of fatal, which is the
 * mitigation recommended in the React issue tracker (facebook/react#11538).
 */
export function installDomMutationGuards() {
  if (typeof Node !== 'function' || (Node.prototype as any).__lovableDomGuards) return;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (import.meta.env.DEV) {
        console.warn('[domPatch] Ignored removeChild on a detached node', child);
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (import.meta.env.DEV) {
        console.warn('[domPatch] Ignored insertBefore with a detached reference node', referenceNode);
      }
      return this.appendChild(newNode) as T;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };

  (Node.prototype as any).__lovableDomGuards = true;
}
