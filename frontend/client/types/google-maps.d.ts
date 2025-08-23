declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts: MapOptions);
      addListener(eventName: string, handler: (event?: any) => void): MapsEventListener;
    }

    interface MapOptions {
      zoom: number;
      center: LatLng | LatLngLiteral;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapMouseEvent {
      latLng: LatLng | null;
    }

    class Marker {
      constructor(opts: MarkerOptions);
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map: Map;
      title?: string;
      icon?: Symbol | string;
    }

    interface Symbol {
      path: SymbolPath | string;
      fillColor?: string;
      fillOpacity?: number;
      strokeWeight?: number;
      scale?: number;
    }

    enum SymbolPath {
      CIRCLE = 0,
      FORWARD_CLOSED_ARROW = 1,
      FORWARD_OPEN_ARROW = 2,
      BACKWARD_CLOSED_ARROW = 3,
      BACKWARD_OPEN_ARROW = 4,
    }

    interface MapsEventListener {
      remove(): void;
    }

    namespace event {
      function removeListener(listener: MapsEventListener): void;
    }
  }
}

export {};
