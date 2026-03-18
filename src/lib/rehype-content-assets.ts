import { resolveContentAssetUrl } from '@/lib/content-assets';

type Node = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
  value?: string;
};

export default function rehypeContentAssets() {
  return (tree: Node) => {
    const isWhitespaceText = (node: Node) =>
      node.type === 'text' && typeof node.value === 'string' && node.value.trim() === '';

    const isElement = (node: Node, tagName: string) =>
      node.type === 'element' && node.tagName === tagName;

    const getCaption = (node: Node) => {
      const title = node.properties?.title;
      if (typeof title === 'string') {
        const trimmed = title.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      return null;
    };

    const getImageWrapper = (node: Node) => {
      if (isElement(node, 'img')) {
        return { wrapper: node, image: node };
      }

      if (isElement(node, 'a') && Array.isArray(node.children)) {
        const meaningful = node.children.filter((child) => !isWhitespaceText(child));
        if (meaningful.length === 1 && isElement(meaningful[0], 'img')) {
          return { wrapper: node, image: meaningful[0] };
        }
      }

      return null;
    };

    const visit = (node: Node, parent?: Node, index?: number) => {
      if (node.type === 'element' && !node.properties) {
        node.properties = {};
      }

      if (node.type === 'element' && node.tagName === 'img') {
        const properties = node.properties ?? (node.properties = {});
        const src = properties.src;
        if (typeof src === 'string') {
          const resolved = resolveContentAssetUrl(src);
          if (resolved) {
            properties.src = resolved;
          }
        }
      }

      if (node.type === 'element' && node.tagName === 'a') {
        const properties = node.properties ?? (node.properties = {});
        const href = properties.href;
        if (typeof href === 'string') {
          const resolved = resolveContentAssetUrl(href);
          if (resolved && resolved !== href) {
            properties.href = resolved;
          }
        }
      }

      if (
        parent &&
        typeof index === 'number' &&
        isElement(node, 'p') &&
        Array.isArray(node.children)
      ) {
        const meaningful = node.children.filter((child) => !isWhitespaceText(child));
        if (meaningful.length === 1) {
          const wrapped = getImageWrapper(meaningful[0]);
          if (wrapped) {
            const caption = getCaption(wrapped.image);
            if (caption) {
              parent.children![index] = {
                type: 'element',
                tagName: 'figure',
                properties: {},
                children: [
                  wrapped.wrapper,
                  {
                    type: 'element',
                    tagName: 'figcaption',
                    properties: {},
                    children: [{ type: 'text', value: caption }]
                  }
                ]
              };
              visit(parent.children![index], parent, index);
              return;
            }
          }
        }
      }

      if (Array.isArray(node.children)) {
        node.children.forEach((child, childIndex) => visit(child, node, childIndex));
      }
    };

    visit(tree);
  };
}
