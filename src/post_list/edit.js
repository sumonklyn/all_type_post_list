import { useSelect } from '@wordpress/data';
import { InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ColorPicker, ToggleControl, Button, SelectControl } from '@wordpress/components';
import './post_list.scss'; // Editor styles only
import { useEntityRecords } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';
import { Fragment, useState, useEffect } from '@wordpress/element';
function getExcerptFromContent(htmlContent, wordLimit = 50) {
  // Remove HTML tags
  const text = htmlContent.replace(/<[^>]+>/g, '');
  // Trim to desired word count
  return text.split(/\s+/).slice(0, wordLimit).join(' ') + '...';
}


const Edit = ({ attributes, setAttributes }) => {
    const { postType, postsPerPage, totalPosts, bgColor, bgSwitch, bgImage, postStyle, columns } = attributes;
    const postTypes = useSelect((select) => {
        return select('core').getPostTypes({ per_page: -1 });
    }, []);
    const [currentPage, setCurrentPage] = useState(1);

    // Reset current page on settings change
    useEffect(() => {
        setCurrentPage(1);
    }, [postsPerPage, totalPosts]);

    // Fetch up to `totalPosts`
    const {
        records: allPosts,
        hasResolved,
    } = useEntityRecords('postType',  postType || 'post', {
        per_page: totalPosts,
        _embed: true,
    });

    const totalFetched = allPosts?.length || 0;
    const totalPages = Math.ceil(totalFetched / postsPerPage);
    const paginatedPosts = allPosts?.slice(
        (currentPage - 1) * postsPerPage,
        currentPage * postsPerPage
    ) || [];

    const backgroundStyle = bgSwitch && bgImage
        ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover' }
        : { background: bgColor };

    const previewBoxStyle = bgSwitch && bgImage
        ? {
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '80px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
          }
        : { display: 'none' };

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
                                    .filter((type) => type.viewable &&
                      ![ 'page', 'media', 'attachment'].includes(type.slug))
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
                        onChange={(val) => setAttributes({ totalPosts: val })
                    }
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

                    <div style={previewBoxStyle}>{__('Background Preview', 'lp')}</div>

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
            </InspectorControls>

            {/* Frontend Preview */}
            <div className="lp-preview" style={backgroundStyle}>
                <h3>{__('Latest Posts', 'lp')}</h3>

                {/* List View */}
                {postStyle === 'list' && (
                    <ul className="lp-list">
                        {paginatedPosts.map((post) => {
                            const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                            return (
                                <li key={post.id}>
                                    {featuredImage && <img src={featuredImage} alt={post.title.rendered} />}
                                    <div className="lp-post-content">
                                        <h4>
                                            <a href={post.link}>{post.title.rendered}</a>
                                        </h4>
                                        <div
                                            className="excerpt"
                                           dangerouslySetInnerHTML={{
                                                __html:
                                                post?.excerpt?.rendered?.trim()
                                                    ? post.excerpt.rendered
                                                    : getExcerptFromContent(post?.content?.rendered || '', 50),
                                            }}
                                        ></div>
                                        <a href={post.link} className="lp-read-more">
                                            {__('Read More', 'lp')}
                                        </a>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {/* Grid View */}
                {postStyle === 'grid' && (
                    <div
                        className="lp-grid"
                        style={{
                            padding: '10px',
                            display: 'grid',
                            gap: '10px',
                            gridTemplateColumns: `repeat(${columns || 3}, minmax(0, 1fr))`,
                        }}
                    >
                        {paginatedPosts.map((post) => {
                            const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                            return (
                                <div key={post.id} id={post.id} className="lp-grid-item">
                                    {featuredImage && <img src={featuredImage} alt={post.title.rendered} />}
                                    <h4>{post.title.rendered}</h4>
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html: post?.excerpt?.rendered?.trim()
                                                ? post.excerpt.rendered
                                                : getExcerptFromContent(post?.content?.rendered || '', 50),
                                        }}
                                    ></p>
                                    <a href={post.link} className="lp-read-more">
                                        {__('Read More', 'lp')}
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Masonry View */}
                {postStyle === 'masonry' && (
                    <div
                        className="lp-masonry"
                        style={{
                            padding: '10px',
                            columnCount: columns || 3,
                            columnGap: '10px',
                        }}
                    >
                        {paginatedPosts.map((post) => {
                            const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                            return (
                                <div key={post.id} className="lp-masonry-item">
                                    {featuredImage && <img src={featuredImage} alt={post.title.rendered} />}
                                    <h4>{post.title.rendered}</h4>
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html: post?.excerpt?.rendered?.trim()
                                                ? post.excerpt.rendered
                                                : getExcerptFromContent(post?.content?.rendered || '', 50),
                                        }}
                                    ></p>
                                    <a href={post.link} className="lp-read-more">
                                        {__('Read More', 'lp')}
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {hasResolved && totalFetched > postsPerPage && (
                    <div className="lp-pagination">
                        {(() => {
                            const pages = [];
                            const startPage = Math.max(1, currentPage - 2);
                            const endPage = Math.min(totalPages, currentPage + 2);

                            // Prev Button
                            pages.push(
                                <button
                                    key="prev"
                                    className="lp-page-button nav"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    « Prev
                                </button>
                            );

                            // First page & ellipsis
                            if (startPage > 1) {
                                pages.push(
                                    <button
                                        key={1}
                                        className="lp-page-button"
                                        onClick={() => setCurrentPage(1)}
                                    >
                                        1
                                    </button>
                                );
                                if (startPage > 2) {
                                    pages.push(<span key="start-ellipsis" className="lp-ellipsis">...</span>);
                                }
                            }

                            // Middle page numbers
                            for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                    <button
                                        key={i}
                                        className={`lp-page-button ${i === currentPage ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(i)}
                                    >
                                        {i}
                                    </button>
                                );
                            }

                            // Ellipsis & last page
                            if (endPage < totalPages - 1) {
                                pages.push(<span key="end-ellipsis" className="lp-ellipsis">...</span>);
                            }
                            if (endPage < totalPages) {
                                pages.push(
                                    <button
                                        key={totalPages}
                                        className="lp-page-button"
                                        onClick={() => setCurrentPage(totalPages)}
                                    >
                                        {totalPages}
                                    </button>
                                );
                            }

                            // Next Button
                            pages.push(
                                <button
                                    key="next"
                                    className="lp-page-button nav"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next »
                                </button>
                            );

                            return pages;
                        })()}
                    </div>
                )}
            </div>
        </Fragment>
    );
};

export default Edit;
