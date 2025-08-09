import { __ } from '@wordpress/i18n';

function getExcerptFromContent(htmlContent, wordLimit = 50) {
    const text = htmlContent.replace(/<[^>]+>/g, '');
    return text.split(/\s+/).slice(0, wordLimit).join(' ') + '...';
}

export default function Preview({ attributes, allPosts, hasResolved, currentPage, setCurrentPage }) {
    const { postsPerPage, bgColor, bgSwitch, bgImage, postStyle, columns, scHedSwitch, scHedText, scHedAlign, scHedFntSize, scHedFntColor } = attributes;

    const totalFetched = allPosts?.length || 0;
    const totalPages = Math.ceil(totalFetched / postsPerPage);
    const paginatedPosts = allPosts?.slice(
        (currentPage - 1) * postsPerPage,
        currentPage * postsPerPage
    ) || [];

    const backgroundStyle = bgSwitch && bgImage
        ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover' }
        : { background: bgColor };

    return (
        <div className="lp-preview" style={backgroundStyle}>
            {scHedSwitch && (
             <div className="lp-posts-header" style={{ textAlign: scHedAlign }}>
                <h3 style={{ fontSize: `${scHedFntSize}px`, color: scHedFntColor }}>{__(scHedText, 'lp')}</h3>
            </div>
            )}
            

            


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

                        if (startPage > 1) {
                            pages.push(
                                <button key={1} onClick={() => setCurrentPage(1)} className="lp-page-button">
                                    1
                                </button>
                            );
                            if (startPage > 2) {
                                pages.push(<span key="start-ellipsis" className="lp-ellipsis">...</span>);
                            }
                        }

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
    );
}
