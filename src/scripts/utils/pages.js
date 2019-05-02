import TreeModel from 'tree-model';
import { getCurrentUserCompanies } from 'utils/api';

const tree = new TreeModel();
const pagesTree = tree.parse({});

window.__PAGES__ = pagesTree;

let LAST_ACTIVE_PAGE;

let onPageChangeCallback = (page) => {};
let onWatchHeartbeatCallback = (video) => {};

setInterval(() => {
  const video = getPlayingVideo();
  const page = getActivePage();

  if (video && page && page.model) {
    const videoOnPage = getVideos(page).find(v => v.internal_id == video.internal_id)
    if (videoOnPage) {
      onWatchHeartbeatCallback(video);
    }
    else {
      onWatchHeartbeatCallback(null);  
    }
  }
  else {
    onWatchHeartbeatCallback(null);
  }
}, 1000);

export function onPageChange(callback) {
  onPageChangeCallback = callback;
}

export function onVideoWatchHeartbeat(callback) {
  onWatchHeartbeatCallback = callback;
}

export function getPlayingVideo() {
  let video;
  pagesTree.all((node) => node.model.topWindow).forEach(node => {
    video = video || getVideos(node).find(video => video.playing);
  });
  return video;
}

export function getActivePage() {
  return pagesTree.first(node => node.model.topWindow && node.model.active);
}

export function getActivePageHref() {
  const activePage = getActivePage();
  return activePage ? activePage.model.href : null;
}

export async function setVideoPlayingState(state, video) {;
  getVideos().forEach(v => v.playing = false);

  const companiesIds = (await getCurrentUserCompanies()).map(c => c.id);
  pagesTree.all((node) => node.model.topWindow).forEach(node => {
    getVideos(node).forEach(v => {
      if (v.internal_id == video.internal_id) {
        const availableForUser = companiesIds.includes(video.company_id);
        v.current_time = video.current_time;
        v.playing = (state === 'playing' && availableForUser) ? true : false;
      }
    })
  });
}

export function setCurrentActiveHref(href, ifCurrentHrefPresent = false) {
  if (ifCurrentHrefPresent && ! getActivePage()) return;
  pagesTree.all((node) => node.model.topWindow).forEach(node => node.model.active = node.model.href == href);

  const currentActivePage = getActivePage();
  if (LAST_ACTIVE_PAGE !== currentActivePage) {
    LAST_ACTIVE_PAGE = currentActivePage;
    onPageChangeCallback(currentActivePage ? currentActivePage.model : null);
  }
}

export function registerContentPage(payload) {
  const node = pagesTree.first((node) => node.model.href == payload.model.href);
  if (node) {
    payload.model.children.forEach(model => {
      const existingChild = node.children.find(n => n.model.href == model.href);
      if (! existingChild) {
        node.addChild(tree.parse(model));
      }
    });
  }
  else if(payload.model.topWindow) {
    pagesTree.addChild(tree.parse(payload.model));
  }
  else {
    pagesTree.addChild(tree.parse(Object.assign({orphan: true}, payload.model)));
  }

  // Moving previously loaded iframes into parent pages
  pagesTree.all(n => n.model.orphan).forEach(node => {
    const replace = pagesTree.first(n => !n.model.orphan && node.model.href == n.model.href);
    if (replace) {
      const child = node.drop();
      delete child.model.orphan;
      replace.parent.addChild(child)
      replace.drop();
    }
  })
}

export function unregisterContentPage(payload) {
  const node = pagesTree.first((node) => node.model.href == payload.href);
  if (node) {
    node.drop();
  }
}

export function registerNewVideo(video) {
  const currentNode = pagesTree.first(node => node.model.href == video.href);
  if (currentNode) {
    currentNode.model.videos = currentNode.model.videos || [];
    const existing = currentNode.model.videos.find(v => v.internal_id == video.internal_id)
    if (! existing) {
      currentNode.model.videos.push(video);
    }
  }
}

export function getVideos(node = null) {
  let videos = [];
  (node || pagesTree).walk((n) => {
    if (n.model.videos) {
      videos = videos.concat(n.model.videos);
    }
  });
  return videos;
}

export function getVideosByHref(href) {
  if (href == null) return [];

  const currentNode = pagesTree.first(node => node.model.href == href);
  if (currentNode) {
    return getVideos(currentNode);
  }
  return [];
}

export function getTopWindowHref(href) {
  const currentNode = pagesTree.first(node => node.model.href == href);
  if (currentNode) {
    const rootNode = currentNode.getPath()[1];
    if (rootNode) {
      return rootNode.model.href;
    }
  }
  return null;
}

export function isTopWindowHref(href) {
  const currentNode = pagesTree.first(node => node.model.href == href);
  return currentNode && currentNode.model && currentNode.model.topWindow;
}

export function considerPageAsChild(parentHref, childHref) {
  const parentNode = pagesTree.first(node => node.model.href == parentHref);

  if (! parentNode) return;

  const existingChild = parentNode.first(childNode => childNode.model.href == childHref);
  if (! existingChild) {
    parentNode.addChild(tree.parse({ href: childHref }));
  }
}