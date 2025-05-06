import { DefaultAttributes } from "./default-attributes";

export function resizeButton (title:string) {
    return `
        <button ${DefaultAttributes} title="${title}" class="tile-resize-button">
            <!-- <svg xmlns="http://www.w3.org/2000/svg" width="18.6" height="18.6" viewBox="0 0 18.6 18.6">
                <g id="Icon_for_size" data-name="Icon for size" transform="translate(-253.747 -1134.203) rotate(45)">
                <path id="Path_1035" data-name="Path 1035" d="M4.588,3.99A.6.6,0,0,0,4,4.67V7.579a.6.6,0,1,0,1.194,0V6.035l7.341,7.341c.15.157.213.054.422,0S15.886,15.3,15.94,15.1h0l-9.9-9.9H7.58A.6.6,0,1,0,7.58,4H4.664A.6.6,0,0,0,4.588,3.99Zm8.36,8.36a.6.6,0,0,0-.416,1.025L15.1,15.94H13.552a.6.6,0,1,0,0,1.194h2.895a.6.6,0,0,0,.688-.688V13.551a.6.6,0,1,0-1.194,0V15.1C13.439,12.608,13.11,12.351,12.948,12.351Z" transform="translate(984.014 612.01)" fill="#5068a8"/>
                </g>
            </svg> -->
        </button>
    `
}