import { PublishManager } from "../../controls/toolbox/PublishManager";
import { AppVersionController } from "../../controls/versions/AppVersionController";
import { AppVersionManager } from "../../controls/versions/AppVersionManager";
import { DebugController } from "../../controls/versions/DebugController";
import { i18n } from "../../i18n/i18n";
import { ToolBoxService } from "../../services/ToolBoxService";
import { ShareLinkView } from "../views/ShareLinkView";
import { TrashView } from "../views/TrashView";
import { VersionSelectionView } from "../views/VersionSelectionView";
import { Button } from "./Button";
import { EditActions } from "./EditActions";
import { Modal } from "./Modal";

export class NavbarLeftButtons {
  container: HTMLElement;
  appVersions: AppVersionManager;
  debugController: DebugController;

  constructor() {
    this.appVersions = new AppVersionManager();
    this.debugController = new DebugController();
    this.container = document.getElementById(
      "navbar-buttons-left"
    ) as HTMLElement;
    this.init();
  }

  init() {
    const debugSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="19.043" height="21.199" viewBox="0 0 19.043 21.199">
          <g id="debug" transform="translate(-26.101 512)">
            <path id="Path_2337" data-name="Path 2337" d="M144.787-511.909a.7.7,0,0,0-.373.551,8.048,8.048,0,0,0,.654,2.158l.2.451-.228.248A4,4,0,0,0,144-506.45a.655.655,0,0,0,1.118.464,1,1,0,0,0,.244-.443,3.438,3.438,0,0,1,1.76-1.926,3.89,3.89,0,0,1,3.032,0,3.413,3.413,0,0,1,1.764,1.938.8.8,0,0,0,.248.443.663.663,0,0,0,1.048-.191c.224-.422-.253-1.537-1.006-2.357l-.207-.228.207-.456a6.542,6.542,0,0,0,.638-2.232.709.709,0,0,0-.663-.563.787.787,0,0,0-.555.3,3.619,3.619,0,0,0-.207.629,7.436,7.436,0,0,1-.526,1.454c-.046.066-.075.062-.356-.054a3.982,3.982,0,0,0-1.9-.323,3.972,3.972,0,0,0-1.876.311,2.461,2.461,0,0,1-.331.124,6.153,6.153,0,0,1-.63-1.694c-.079-.389-.182-.555-.41-.663A.587.587,0,0,0,144.787-511.909Z" transform="translate(-113.017)" fill="#7c8791"/>
            <path id="Path_2338" data-name="Path 2338" d="M29.116-406.013a.83.83,0,0,0-.236.277.667.667,0,0,0-.07.48,3.714,3.714,0,0,0,1.259,2.386,1.068,1.068,0,0,1,.248.269c-.008.017-.1.191-.207.385s-.244.48-.306.634c-.1.244-.128.282-.2.257a16.882,16.882,0,0,0-2.684-.4c-.4-.012-.563.058-.729.3a.485.485,0,0,0-.083.389c.029.447.244.617.841.663a17.491,17.491,0,0,1,1.814.253c.48.091.567.12.551.178a16.06,16.06,0,0,0-.041,4.622,7.775,7.775,0,0,0,1.822,4.286,6.04,6.04,0,0,0,4.821,1.727,6.4,6.4,0,0,0,3.259-.9,6.22,6.22,0,0,0,1.537-1.52,9.364,9.364,0,0,0,1.321-4.108,21.11,21.11,0,0,0,0-3.624c-.041-.228-.083-.443-.1-.48-.017-.058.07-.087.551-.178a17.834,17.834,0,0,1,1.835-.253c.576-.046.8-.224.82-.663a.485.485,0,0,0-.083-.389c-.166-.244-.331-.315-.729-.3a16.882,16.882,0,0,0-2.684.4c-.075.025-.1-.012-.2-.257-.062-.153-.2-.439-.306-.634s-.2-.369-.207-.385a1.068,1.068,0,0,1,.248-.269,3.714,3.714,0,0,0,1.259-2.386.667.667,0,0,0-.07-.48.617.617,0,0,0-.58-.373c-.41,0-.638.232-.7.712a2.005,2.005,0,0,1-.468,1.139,3.117,3.117,0,0,1-.4.431l-.207.17-.153-.1a7.46,7.46,0,0,0-2.928-.841,10.165,10.165,0,0,0-5.5.816l-.195.128-.215-.178a3.516,3.516,0,0,1-.646-.8,2.212,2.212,0,0,1-.22-.77.7.7,0,0,0-.331-.617A.69.69,0,0,0,29.116-406.013Zm7.293,2.725a10.04,10.04,0,0,1,2.477.534,3.619,3.619,0,0,1,1.416,2.009,8.015,8.015,0,0,1,.46,2.974c-.008,3.061-.675,5.131-1.992,6.171a4.507,4.507,0,0,1-2.858.928,5.324,5.324,0,0,1-2.713-.485c-1.47-.716-2.29-2.187-2.609-4.659a20.054,20.054,0,0,1-.1-2.746c.112-1.942,1.006-3.868,1.967-4.233a11.946,11.946,0,0,1,2.477-.509A9.768,9.768,0,0,1,36.409-403.288Z" transform="translate(0 -101.502)" fill="#7c8791"/>
            <path id="Path_2339" data-name="Path 2339" d="M194.807-327.881a.811.811,0,0,0-.447.505.724.724,0,0,0,.149.572,5.654,5.654,0,0,0,.634.431c.3.178.663.406.82.505l.277.178v4.291a34.46,34.46,0,0,0,.066,4.431.7.7,0,0,0,1.147.083l.091-.128.021-4.349.021-4.349.766-.464c.87-.53,1.015-.646,1.077-.882a.612.612,0,0,0-.182-.65.632.632,0,0,0-.663-.178c-.066.025-.472.261-.9.522l-.779.476-.779-.476C195.143-327.964,195.118-327.972,194.807-327.881Z" transform="translate(-161.281 -176.453)" fill="#7c8791"/>
            <path id="Path_2340" data-name="Path 2340" d="M39.478-215.775c-.306.108-.447.311-.692.994a12.842,12.842,0,0,0-.435,1.739,3.47,3.47,0,0,0,.128,1.574c.058.273.124.712.149.973.062.646.012.882-.236,1.135a.756.756,0,0,0-.257.658.67.67,0,0,0,.965.493,1.891,1.891,0,0,0,.8-1.073,5.355,5.355,0,0,0-.1-2.51,2.457,2.457,0,0,1-.1-1.064,7.638,7.638,0,0,1,.58-1.976.672.672,0,0,0-.435-.961A.38.38,0,0,0,39.478-215.775Z" transform="translate(-11.53 -283.904)" fill="#7c8791"/>
            <path id="Path_2341" data-name="Path 2341" d="M420.687-215.867a.677.677,0,0,0-.414.957,7.637,7.637,0,0,1,.58,1.976,2.457,2.457,0,0,1-.1,1.064,5.355,5.355,0,0,0-.1,2.51,1.891,1.891,0,0,0,.8,1.073.669.669,0,0,0,.969-.538.72.72,0,0,0-.282-.634c-.306-.3-.319-.87-.046-2.191a3.33,3.33,0,0,0,.1-1.479,9.7,9.7,0,0,0-.663-2.294.837.837,0,0,0-.505-.451,1,1,0,0,0-.174-.037A1.394,1.394,0,0,0,420.687-215.867Z" transform="translate(-377.776 -283.825)" fill="#7c8791"/>
          </g>
        </svg>
    `;

    let debugButton = document.createElement("button");
    debugButton.innerHTML = debugSvg;
    debugButton.setAttribute("title", i18n.t("navbar.debug.label"))

    debugButton.classList.add("tb-icon-button")
    debugButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.initialiseDebug();
      this.debugController.init();
    });

    const shareButtonSvg: string = `
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="22" viewBox="0 0 21 22">
          <g id="share" transform="translate(21) rotate(90)" fill="#fff">
            <path d="M 18.69462013244629 20.2500057220459 L 3.30538010597229 20.2500057220459 C 2.8575599193573 20.2500057220459 2.467750072479248 20.0302562713623 2.235919952392578 19.64711761474609 C 2.004080057144165 19.26396751403809 1.990300059318542 18.81669616699219 2.198090076446533 18.41998672485352 L 9.892709732055664 3.730276584625244 C 10.11246967315674 3.310746669769287 10.52639961242676 3.0602867603302 11 3.0602867603302 C 11.47360038757324 3.0602867603302 11.88753032684326 3.310746669769287 12.10729026794434 3.730276584625244 L 19.80191040039062 18.41999626159668 C 20.00970077514648 18.81669616699219 19.99592018127441 19.26396751403809 19.76408004760742 19.64711761474609 C 19.53224945068359 20.0302562713623 19.14244079589844 20.2500057220459 18.69462013244629 20.2500057220459 Z" stroke="none"/>
            <path d="M 11 3.810276031494141 C 10.8870096206665 3.810276031494141 10.67922973632812 3.845096588134766 10.55708980560303 4.078277587890625 L 2.862470626831055 18.76799774169922 C 2.74867057800293 18.9852466583252 2.823099136352539 19.16877746582031 2.877599716186523 19.25883674621582 C 2.932090759277344 19.34890747070312 3.060129165649414 19.49999618530273 3.305379867553711 19.49999618530273 L 18.69462013244629 19.49999618530273 C 18.93987083435059 19.49999618530273 19.06790924072266 19.34890747070312 19.12240028381348 19.25883674621582 C 19.17689895629883 19.16877746582031 19.25132942199707 18.9852466583252 19.13752937316895 18.76799774169922 L 11.44291973114014 4.078287124633789 C 11.32077026367188 3.845096588134766 11.1129903793335 3.810276031494141 11 3.810276031494141 M 10.99999618530273 2.310276031494141 C 11.698655128479 2.310276031494141 12.39731502532959 2.667606353759766 12.77165985107422 3.382266998291016 L 20.46627998352051 18.07198715209961 C 21.16382026672363 19.40365600585938 20.19791030883789 20.99999618530273 18.69462013244629 20.99999618530273 L 3.305379867553711 20.99999618530273 C 1.802089691162109 20.99999618530273 0.8361797332763672 19.40365600585938 1.533720016479492 18.07198715209961 L 9.228340148925781 3.382266998291016 C 9.602680206298828 2.667606353759766 10.30133724212646 2.310276031494141 10.99999618530273 2.310276031494141 Z" stroke="none" fill="#7c8791"/>
          </g>
        </svg>

    `;

    let shareButton = document.createElement("button")
    shareButton.setAttribute("title", i18n.t("navbar.share.label"))
    shareButton.innerHTML = shareButtonSvg;
    shareButton.classList.add("tb-icon-button")

    
    const trashButtonSvg = `
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
      width="20" height="24" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">
      <g>
        <polyline fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" points="25,8 25,1 39,1 39,8 	"/>
        <polyline fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" points="14,10 14,63 50,63 50,10 	"/>
        <line fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" x1="26" y1="20" x2="26" y2="54"/>
        <line fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" x1="38" y1="20" x2="38" y2="54"/>
        <line fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" x1="10" y1="9" x2="54" y2="9"/>
      </g>
    </svg>
    `;

    let trashButton = document.createElement("button")
    trashButton.setAttribute("title", i18n.t("navbar.trash.label"));
    trashButton.innerHTML = trashButtonSvg;
    trashButton.classList.add("tb-icon-button");

    const versionSelection = new VersionSelectionView();
    
    versionSelection.render(this.container);
    this.container.appendChild(debugButton);
    this.container.appendChild(shareButton)
    // this.container.appendChild(trashButton);
    // shareButton.render(this.container);

    shareButton.addEventListener("click", (e) => {
      e.preventDefault();
      new ShareLinkView().openShareLinkModal();
    });

    trashButton.addEventListener("click", (e) => {
      e.preventDefault();
      new TrashView().openTrashModal();
    })

  }

  initialiseDebug() {
    const debugDiv = document.createElement("div");
    debugDiv.id = "tb-debugging";
    debugDiv.innerHTML = `
      <div class="tb_debug-spinner-container">
          <div class="tb_debug-spinner"></div>
      </div>
      <p style="text-align: center; font-size: 14px; margin-top: 10px">Please wait while we are checking the urls...</p>
    `;

    const modal = new Modal({
      title: i18n.t("navbar.debug.modal_title"),
      width: "800px",
      body: debugDiv,
    });

    modal.open();
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
