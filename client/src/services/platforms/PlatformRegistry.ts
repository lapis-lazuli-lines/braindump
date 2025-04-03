// client/src/services/platforms/PlatformRegistry.ts
import { PlatformAdapter } from "./PlatformAdapter";
import { FacebookAdapter } from "./FacebookAdapter";
import { InstagramAdapter } from "./InstagramAdapter";
import { TwitterAdapter } from "./TwitterAdapter";

// Registry of all available platform adapters
class PlatformRegistry {
	private adapters: Map<string, PlatformAdapter> = new Map();

	constructor() {
		// Register all platform adapters
		this.registerAdapter(new FacebookAdapter());
		this.registerAdapter(new InstagramAdapter());
		this.registerAdapter(new TwitterAdapter());
		// Add more adapters as they are implemented
	}

	/**
	 * Register a platform adapter
	 * @param adapter The adapter to register
	 */
	registerAdapter(adapter: PlatformAdapter): void {
		this.adapters.set(adapter.platform, adapter);
	}

	/**
	 * Get an adapter by platform ID
	 * @param platform Platform identifier
	 * @returns The platform adapter or undefined if not found
	 */
	getAdapter(platform: string): PlatformAdapter | undefined {
		return this.adapters.get(platform);
	}

	/**
	 * Get all registered adapters
	 * @returns Array of all platform adapters
	 */
	getAllAdapters(): PlatformAdapter[] {
		return Array.from(this.adapters.values());
	}

	/**
	 * Check if an adapter exists for a platform
	 * @param platform Platform identifier
	 * @returns True if adapter exists
	 */
	hasAdapter(platform: string): boolean {
		return this.adapters.has(platform);
	}
}

// Create and export a singleton instance
export const platformRegistry = new PlatformRegistry();

export default platformRegistry;
