import React from 'react';
import ReactMarkdown from 'react-markdown';

import './about.css'

import about from '../text/about.md';
import limitations from '../text/limitations.md';

const AboutPage = ({close}) => (
	<div id="about">
    <button id="close-button" onClick={close}>x</button>
		<ReactMarkdown source={about} />
		<ReactMarkdown source={limitations} />
	</div>
);

export default AboutPage;