
import * as pageDetect from 'github-url-detection';
import elementReady from 'element-ready';
import React from 'dom-chef';
import select from 'select-dom';

import features from '.';

function listElement(value: string, baseUrl: string) {
	const filter = `+label%3A"difficulty%3A+${value.replaceAll(' ', '+')}"`;
	const classField = value.replace(' ', '-');
	let ticked: any = 'false';
	let url = "";
	if (location.href.includes(filter.replaceAll('"', '%22'))) {
		ticked = 'true';
		url = baseUrl.replace(filter.replaceAll('"', '%22'), '');
	} else {
		url = `${baseUrl}${filter}`;
	}

	return (<a className={`SelectMenu-item difficulty-${classField}`} aria-checked={ticked} role="menuitemradio" href={url}>
	<svg className="octicon octicon-check SelectMenu-icon SelectMenu-icon--check" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg>
	<span>{value}</span>
</a>)
}

async function init(): Promise<void | false> {
	const sortTab = (await elementReady('#sort-select-menu', {waitForChildren: false}));
	const data = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
	const baseUrl: string = select('[aria-checked="true"]',sortTab)?.getAttribute("href") as string;


	sortTab?.after(
		<details className="details-reset details-overlay d-inline-block position-relative pr-3 pr-sm-0 px-3" id="difficulty-select-menu">
			<summary className="btn-link" title="Difficulty" aria-haspopup="menu" data-ga-click="Issues, Table filter, Difficulty" role="button">
				Difficulty <span></span>
				<span className="dropdown-caret hide-sm"></span>
			</summary>
			<details-menu className="SelectMenu SelectMenu--hasFilter right-0" role="menu" aria-label="Difficulty">
				<div className="SelectMenu-modal">
				<header className="SelectMenu-header">
					<span className="SelectMenu-title">Select Difficulty</span>
					<button className="SelectMenu-closeButton" type="button" data-toggle-for="diffculty-select-menu">
					<svg aria-label="Close menu" className="octicon octicon-x" viewBox="0 0 16 16" version="1.1" width="16" height="16" role="img"><path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path></svg>
					</button>
				</header>

				<div className="SelectMenu-list">
					{data.map(value => listElement(value, baseUrl))}
				</div>
				</div>
			</details-menu>
		</details>
	)

	const labels: HTMLElement[] = select.all('[data-name^="difficulty:"]')

	labels.forEach((label: HTMLElement) => {
		/* tslint:disable-next-line */
		const element: HTMLElement = label.parentElement?.parentElement?.parentElement as HTMLElement;
		const outputElement = select('.col-3', element);
		const finalElement = select.last('.ml-2', outputElement);
		const copy = label.cloneNode(true);
		copy.innerText = copy.innerText.replace('difficulty: ', '');
		copy.style.position = 'relative';
		copy.style.top = '25%';
		label.remove();
		if (finalElement)
			finalElement.innerHTML = copy.outerHTML.replaceAll('<br>', '');
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoIssueList
	],
	awaitDomReady: false,
	init
});
