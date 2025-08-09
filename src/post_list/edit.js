import { useSelect } from '@wordpress/data';
import { InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ColorPicker, ToggleControl, Button, ButtonGroup, Icon, SelectControl,  __experimentalNumberControl as NumberControl,  ColorPalette, TextControl  } from '@wordpress/components';
import { alignLeft, alignCenter, alignRight, alignJustify } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { Fragment, useState, useEffect } from '@wordpress/element';
import { useEntityRecords } from '@wordpress/core-data';
import './post_list.scss'; // Editor styles only
import Preview from './preview';

function Edit({ attributes, setAttributes }) {
    const { postType, postsPerPage, totalPosts, bgColor, bgSwitch, bgImage, postStyle, columns, scHedSwitch, scHedText, scHedAlign, scHedFntSize, scHedFntColor  } = attributes;
    const postTypes = useSelect((select) => {
        return select('core').getPostTypes({ per_page: -1 });
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    useEffect(() => {
        setCurrentPage(1);
    }, [postsPerPage, totalPosts]);

    const { records: allPosts, hasResolved } = useEntityRecords('postType', postType || 'post', {
        per_page: totalPosts,
        _embed: true,
    });

    return (
        <Fragment>
            <InspectorControls>
                {/* General Settings */}
                <PanelBody title={__('General', 'lp')} initialOpen={true}>
                    <SelectControl
                        label={__('Select Post Type', 'lp')}
                        value={postType}
                        options={
                            postTypes
                                ? postTypes
                                    .filter((type) => type.viewable && !['page', 'media', 'attachment'].includes(type.slug))
                                    .map((type) => ({
                                        label: type.name,
                                        value: type.slug,
                                    }))
                                : [{ label: __('Loading...', 'lp'), value: '' }]
                        }
                        onChange={(val) => setAttributes({ postType: val })}
                    />
                    <RangeControl
                        label={__('Total Posts to Load', 'lp')}
                        value={totalPosts}
                        onChange={(val) => setAttributes({ totalPosts: val })}
                        min={1}
                        max={100}
                    />
                    <RangeControl
                        label={__('Posts Per Page', 'lp')}
                        value={postsPerPage}
                        onChange={(val) => setAttributes({ postsPerPage: val })}
                        min={1}
                        max={totalPosts}
                    />
                </PanelBody>

                {/* Background Style */}
                <PanelBody title={__('Background Style', 'lp')} initialOpen={false}>
                    <ToggleControl
                        label="Show Background Image"
                        checked={bgSwitch}
                        onChange={(value) => setAttributes({ bgSwitch: value })}
                    />

                    {!bgSwitch && (
                        <>
                            <div style={{ marginBottom: '10px' }}>
                                <h2 style={{ marginBottom: '5px' }}>Background Color:</h2>
                                <p style={{ fontSize: '12px', marginBottom: '5px' }}>
                                    Select a background color for the block. If you choose an image, this will be ignored.
                                </p>
                            </div>
                            <ColorPicker
                                color={bgColor}
                                onChangeComplete={(value) => setAttributes({ bgColor: value.hex })}
                                disableAlpha
                            />
                        </>
                    )}

                    {bgSwitch && (
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={(media) => setAttributes({ bgImage: media.url })}
                                allowedTypes={['image']}
                                render={({ open }) => (
                                    <div style={{ marginBottom: '10px', width: '100%', textAlign: 'center' }}>
                                        <Button
                                            onClick={open}
                                            variant="primary"
                                            style={{
                                                marginTop: '10px',
                                                backgroundColor: 'rgb(235 82 67)',
                                                color: '#fff',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            {bgImage ? 'Change Image' : 'Select Image'}
                                        </Button>
                                    </div>
                                )}
                            />
                        </MediaUploadCheck>
                    )}
                </PanelBody>

                {/* Post Listing Style */}
                <PanelBody title={__('Post Listing Style', 'lp')} initialOpen={false}>
                    <SelectControl
                        label={__('Select Layout Style', 'lp')}
                        value={postStyle}
                        options={[
                            { label: 'Grid', value: 'grid' },
                            { label: 'List', value: 'list' },
                            { label: 'Masonry', value: 'masonry' },
                        ]}
                        onChange={(value) => setAttributes({ postStyle: value })}
                        help={__('Choose how posts should be displayed.', 'lp')}
                    />
                    {(postStyle === 'grid' || postStyle === 'masonry') && (
                        <RangeControl
                            label={__('Number of Columns', 'lp')}
                            value={columns}
                            onChange={(value) => setAttributes({ columns: value })}
                            min={1}
                            max={6}
                            help={__('Choose how many columns to show.', 'lp')}
                        />
                    )}
                </PanelBody>

                {/* Post Listing Layout */}
                <PanelBody title={__('Section Layout', 'lp')} initialOpen={false}>
                    <ToggleControl
                        label="Show Section Heading"
                        checked={scHedSwitch}
                        onChange={(value) => setAttributes({ scHedSwitch: value })}
                    />
                    {scHedSwitch && (
                    <PanelBody title={__('Heading Style', 'lp')} initialOpen={scHedSwitch}>
                        {/* Text Input for Header */}
                        <TextControl
                            label={__('Header Text', 'lp')}
                            value={scHedText}
                            onChange={(val) => setAttributes({ scHedText: val })}
                            placeholder={__('Enter header text…', 'lp')}
                        />
                        
                        {/* Header Alignment */}
                        <>
                            <div style={{ marginBottom: '10px' }}>
                                <h2 style={{ marginBottom: '5px' }}>Heading Alignment:</h2>
                            </div>
                            <ButtonGroup>
                                <Button
                                    isPressed={attributes.scHedAlign === 'left'}
                                    onClick={() => setAttributes({ scHedAlign: 'left' })}
                                >
                                    <Icon icon={alignLeft} />
                                </Button>
                                <Button
                                    isPressed={attributes.scHedAlign === 'center'}
                                    onClick={() => setAttributes({ scHedAlign: 'center' })}
                                >
                                    <Icon icon={alignCenter} />
                                </Button>
                                <Button
                                    isPressed={attributes.scHedAlign === 'right'}
                                    onClick={() => setAttributes({ scHedAlign: 'right' })}
                                >
                                    <Icon icon={alignRight} />
                                </Button>
                                <Button
                                    isPressed={attributes.scHedAlign === 'justify'}
                                    onClick={() => setAttributes({ scHedAlign: 'justify' })}
                                >
                                    <Icon icon={alignJustify} />
                                </Button>
                            </ButtonGroup>
                        </>
                        <NumberControl
                            label={__('Font Size', 'lp')}
                            value={scHedFntSize}
                            onChange={(value) => setAttributes({ scHedFntSize: value })}
                            min={1}
                            max={100}
                            isShiftStepEnabled={ true }   // optional: enable shift+arrow for bigger steps
                            shiftStep={ 1 } 
                        />

                        {/* New Color Picker */}
                        <>
                            <div style={{ marginBottom: '10px' }}>
                                <h2 style={{ marginBottom: '5px' }}>Heading Color:</h2>
                                <p style={{ fontSize: '12px', marginBottom: '5px' }}>
                                    Select a section heading color for the block.
                                </p>
                            </div>                               
                        
                            <ColorPalette
                                label={__('Text Color', 'lp')}      
                                value={scHedFntColor}
                                onChange={(color) => setAttributes({ scHedFntColor: color })} 
                                colors={[
                                    { name: 'Black', color: '#000000' },
                                    { name: 'White', color: '#ffffff' },
                                    { name: 'Red', color: '#ff0000' },
                                    { name: 'Green', color: '#00ff00' },
                                    { name: 'Blue', color: '#0000ff' },
                                ]}  
                                __experimentalIsExpanded={isColorPickerOpen}
                                onFocus={() => setIsColorPickerOpen(true)}
                                onBlur={() => setIsColorPickerOpen(false)}
                                __experimentalOnChange={(color) => setAttributes({ scHedFntColor: color })}
                                __experimentalIsFullWidth={true}
                            />
                        </>
                    </PanelBody>
                    )}
                </PanelBody>

            </InspectorControls>

            {/* Preview */}
            <Preview
                attributes={attributes}
                allPosts={allPosts}
                hasResolved={hasResolved}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
        </Fragment>
    );
}

export default Edit;
