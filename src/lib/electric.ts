export function getNoopShapeUrl(): string {
  return `/api/shapes/noop`;
}

export function getBinsShapeUrl(locationId: string): string {
  return `/api/shapes/bins?location_id=${encodeURIComponent(locationId)}`;
}

export function getPhotosShapeUrl(locationId: string): string {
  return `/api/shapes/photos?location_id=${encodeURIComponent(locationId)}`;
}

export function getLocationMembersShapeUrl(locationId: string): string {
  return `/api/shapes/location-members?location_id=${encodeURIComponent(locationId)}`;
}

export function getTagColorsShapeUrl(locationId: string): string {
  return `/api/shapes/tag-colors?location_id=${encodeURIComponent(locationId)}`;
}
