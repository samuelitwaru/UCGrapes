import { DefaultAttributes } from "../../utils/default-attributes";

export class AddInfoSectionButton {
  private isFirstSectionButton: boolean;
  private isLastSectionButton: boolean;
  private isBlankInfoPage: boolean;
  private isUntitledPage: boolean;

  constructor(isFirstSection: boolean = false, isLastSection: boolean = false, isNewPage: boolean = false, isUntitledPage: boolean = false) {
    this.isFirstSectionButton = isFirstSection;
    this.isLastSectionButton = isLastSection;
    this.isBlankInfoPage = isNewPage;
    this.isUntitledPage = isUntitledPage;
  }

  public getHTML(): string {
    const spacingClass = [
      'info-section-spacing-container',
      this.isFirstSectionButton ? 'first-section' : '',
      this.isLastSectionButton ? 'last-section' : '',
      this.isBlankInfoPage ? 'blank-page' : '',
      this.isUntitledPage ? 'untitled-page' : '',
    ].join(' ').trim();

    return `
      <div ${DefaultAttributes} data-type="add-button" data-custom="add-button" class="${spacingClass}">
        <div ${DefaultAttributes} class="add-new-info-section">
          <hr ${DefaultAttributes} class="add-new-info-hr" />
          <svg ${DefaultAttributes} xmlns="http://www.w3.org/2000/svg" id="Component_67_2" data-name="Component 67 – 2" width="30" height="30" viewBox="0 0 30 30">
            <g ${DefaultAttributes} id="Group_2309" data-name="Group 2309">
              <g ${DefaultAttributes} id="Group_2307" data-name="Group 2307">
                <g ${DefaultAttributes} id="Ellipse_6" data-name="Ellipse 6" fill="#fdfdfd" stroke="#5068a8" stroke-width="1">
                  <circle ${DefaultAttributes} cx="15" cy="15" r="15" stroke="none" />
                  <circle ${DefaultAttributes} cx="15" cy="15" r="14.5" fill="none" />
                </g>
              </g>
            </g>
            <path ${DefaultAttributes} id="Icon_ionic-ios-add" data-name="Icon ionic-ios-add"
              d="M21.895,15H16.717V9.823a.858.858,0,1,0-1.717,0V15H9.823a.858.858,0,0,0,0,1.717H15v5.177a.858.858,0,1,0,1.717,0V16.717h5.177a.858.858,0,1,0,0-1.717Z"
              transform="translate(-0.692 -1.025)" fill="#5068a8" />
          </svg>
        </div>
      </div>
    `;
  }
}

