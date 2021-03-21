import 'typed-query-selector';
import select from 'select-dom';

import './features/bugs-tab';
import './features/features-tab';
import './features/issues-tab';
import './features/diffculty-filter';


// Add global for easier debugging
(window as any).select = select;
