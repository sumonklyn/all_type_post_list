import { registerBlockType } from '@wordpress/blocks';
import Edit from './post_list/edit';
import Save from './post_list/save';
import FaqEdit from './faq/faq';
import FaqSave from './faq/save';

registerBlockType('lp/latest-posts', {
    title: 'SKM Latest Posts',
    icon: 'list-view',
    category: 'widgets',
    attributes: {
        postType: {
            type: 'string',
            default: 'post'
        },
        totalPosts: {
            type: 'number',
            default: 3,
        },
        postsPerPage: {
            type: 'number',
            default: 3,
        },
        bgColor: {
            type: 'string',
            default: '',
        },
        bgSwitch: {
            type: 'boolean',
            default: false,
        },
        bgImage: {
            type: 'string',
            default: '',
        },
        postStyle: {
            type: 'string',
            default: 'grid',
        },
        columns: {
            type: 'number',
            default: 3,
        },
        scHedSwitch: {
            type: 'boolean',
            default: true,
        },
        scHedFntSize: {
            type: 'number',
            default: 30,
        },
        scHedFntColor: {
            type: 'string',
            default: '#ffffffff',
        },
        scHedText: {
            type: 'string',
            default: 'Latest Posts',
        },
        scHedAlign: {
            type: 'string',
            default: 'left',
        },

    },
    edit: Edit,
    save: Save,
});

registerBlockType('lp/faq', {
    title: 'SKM FAQ',
    icon: 'list-view',
    category: 'widgets',
    attributes: {
        faqTitle: {
            type: 'string',
            default: 'Frequently Asked Questions',
        },
        faqItems: {
            type: 'array',
            default: [],
        },
        bgColor: {
            type: 'string',
            default: '',
        },
        bgSwitch: {
            type: 'boolean',
            default: false,
        },
        bgImage: {
            type: 'string',
            default: '',
        },

    },
    edit: FaqEdit,
    save: FaqSave,
});