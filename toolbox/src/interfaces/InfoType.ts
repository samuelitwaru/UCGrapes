import { CtaAttributes } from "./CtaAttributes";
import { Tile } from "./Tile";

export interface InfoType {
  InfoId: string;
  InfoType: string;
  InfoValue?: string;
  InfoPositionId?: string;
  CtaAttributes?: CtaAttributes;
  Tiles?:Tile[];
}
