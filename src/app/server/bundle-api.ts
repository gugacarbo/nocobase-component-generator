import {
	BundleService,
	type BundleRequest,
	type BundleResponse,
} from "../../services/BundleService";

export { BundleService };
export type { BundleRequest, BundleResponse };

export async function handleBundleRequest(
	req: BundleRequest,
): Promise<BundleResponse> {
	return BundleService.handleBundleRequest(req);
}
