import { bugHuntImage } from "@/features/bug-hunt/og";

export const alt = "Bug Hunt on Hidash OS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
    return bugHuntImage(null);
}
