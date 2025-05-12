import { CtaAttributes } from "./CtaAttributes";
import { Image } from "./Image";
import { Tile } from "./Tile";

export interface InfoType {
  InfoId: string;
  InfoType: string;
  InfoValue?: string;
  InfoPositionId?: string;
  Images?: Image[];
  CtaAttributes?: CtaAttributes;
  Tiles?:Tile[];
}
