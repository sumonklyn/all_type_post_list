<?php
/**
 * Plugin Name: Latest Posts Block (React)
 * Description: A Gutenberg block that shows latest posts with input to set total post count.
 * Version: 1.0
 * Author: Your Name
 * Text Domain: lp
 */

function lp_register_block() {
    // Auto includes the JS output
    wp_register_script(
        'lp-block',
        plugins_url( 'build/index.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-data' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/index.js' )
    );

    // Frontend style
    wp_enqueue_style(
        'lp-frontend-style',
        plugins_url( 'src/post_list/post_list.scss', __FILE__ ),
        array(),
        filemtime( plugin_dir_path( __FILE__ ) . 'src/post_list/post_list.scss' )
    );

    register_block_type( 'lp/latest-posts', array(
        'editor_script'   => 'lp-block',
        'render_callback' => 'lp_render_latest_posts',
        'attributes'      => array(
            'postType'=> array(
                'type'    => 'string',
                'default' => 'post',
            ),
            'totalPosts'=> array(
                'type' => 'number',
                'default'=> 3,
            ),
            'postsPerPage' => array(
                'type'    => 'number',
                'default' => 3,
            ),
            'bgSwitch' => array(
                'type' => 'boolean',
                'default' => false,
            ),
            'bgColor' => array(
                'type' => 'string',
                'default' => '#FFFFFF',
            ),
            'bgImage' => array(
                'type' => 'string',
                'default' => '',
            ),
            'postStyle' => array(
                'type' => 'style',
                'default' => 'grid',
            ),
            'columns' => array(
                'type' => 'number',
                'default' => 3,
            ),
        ),
    ));
}
add_action( 'init', 'lp_register_block' );

function lp_render_latest_posts( $attributes ) {
    $postType = $attributes['postType'] ?? 'post';
    $totalPosts = $attributes['totalPosts'] ?? 3;
    $postsPerPage = $attributes['postsPerPage'] ?? 3;
    $postStyle = $attributes['postStyle'] ?? 'grid';
    $postStyle = esc_attr( $postStyle );
    if($postStyle == 'list'){
        $beforeLoop = '<ul class="lp-list">';
        $inLoopStart = '<li>';
        $inLoopEnd = '</li>';
        $afterLoop = '</ul>';   
    }elseif($postStyle == 'grid'){
        $columns = isset($attributes['columns']) ? intval($attributes['columns']) : 3;
        $beforeLoop = '<div class="lp-grid" style="padding:10px; display:grid; gap:10px; grid-template-columns:repeat(' . $columns . ', minmax(0, 1fr));">';
        $inLoopStart = '<div class="lp-grid-item">';
        $inLoopEnd = '</div>';
        $afterLoop = '</div>';
    }elseif($postStyle == 'masonry'){
        $columns = isset($attributes['columns']) ? intval($attributes['columns']) : 3;
        $beforeLoop = '<div class="lp-masonry" style="padding:10px; column-count:' . $columns . '; column-gap:10px;">';
        $inLoopStart = '<div class="lp-masonry-item">';
        $inLoopEnd = '</div>';
        $afterLoop = '</div>';  
    }
    
    $bgSwitch = isset( $attributes['bgSwitch'] ) ? $attributes['bgSwitch'] : false; // Either background is image or color   
    $bgColor = isset( $attributes['bgColor'] ) ? esc_attr($attributes['bgColor']) : '#FFFFFF';
    $bgImage = isset( $attributes['bgImage'] ) ?  esc_url( $attributes['bgImage'] )  : '';

    $style = '';
    if ( $bgSwitch ) {
        $style = 'style="background-image:url('.$bgImage.'); background-size:cover;';
    }else{
        $style = "style='background:$bgColor;'";
    }


    ob_start();

    // Get current page for pagination
    $paged = get_query_var('paged') ? get_query_var('paged') : 1;

    // Step 1: Get latest 30 post IDs (sorted DESC by date)
    $initial_query = new WP_Query([
        'post_type'      => $postType,
        'posts_per_page' => $totalPosts,
        'orderby'        => 'date',
        'order'          => 'DESC',
        'post_status'    => 'publish',
        'fields'         => 'ids',
    ]);

    $all_ids = $initial_query->posts;

    // Step 2: Slice for pagination
    $per_page = $postsPerPage;
    $total_pages = ceil(count($all_ids) / $per_page);
    $offset = ($paged - 1) * $per_page;
    $paged_ids = array_slice($all_ids, $offset, $per_page);

    // Step 3: Get paginated posts
    $final_query = new WP_Query([
        'post_type'      => $postType,
        'post__in'       => $paged_ids,
        'orderby'        => 'post__in',
        'post_status'    => 'publish',
        'posts_per_page' => $per_page,
    ]);
    $outPut = '<div class="lp-preview" ' . $style . $totalPosts. '">';
    $outPut .= '<h3 class="lp-title">' . __('Latest Posts', 'lp') . '</h3>';
    // Step 4: Output loop
    if ($final_query->have_posts()) {
        $outPut .= $beforeLoop;
        while ($final_query->have_posts()) {
            $final_query->the_post();
            $featured_image_url = get_the_post_thumbnail_url(get_the_ID(), 'full');
            $outPut .= $inLoopStart;    
            if ($featured_image_url) {
                $outPut .= '<img src="' . $featured_image_url . '" alt="' . get_the_title() . '" />';
            }
            if( $postStyle == 'list' ){
                $outPut .= '<div class="lp-post-content">';
            }
            $outPut .= '<h4><a href="' . get_the_permalink() . '">' . get_the_title() . '</a></h4>';
            $outPut .= '<p>' . get_the_excerpt() . '</p>';
            $outPut .= '<a href="' . get_the_permalink() . '" class="lp-read-more">' . __('Read More', 'lp') . '</a>';
            if( $postStyle == 'list' ){
                $outPut .= '</div>';
            }

            $outPut .= $inLoopEnd;
        }
        $outPut .= $afterLoop;

        // Pagination
        $current_page = max(1, get_query_var('paged'));
$total_pages = ceil(count($all_ids) / $postsPerPage); // If you're slicing total 30 manually

$outPut .= lp_custom_pagination($current_page, $total_pages);
    } else {
        $outPut .= '<p>No Post Found.</p>';
    }
    $outPut .= '</div>';
    return $outPut;
}


function lp_custom_pagination( $current_page, $total_pages ) {
    if ( $total_pages <= 1 ) return;

    $output = '<div class="lp-pagination">';
    $start_page = max(1, $current_page - 2);
    $end_page = min($total_pages, $current_page + 2);

    // Prev button
    $output .= sprintf(
        '<button class="lp-page-button nav" %s onclick="location.href=\'%s\'">« Prev</button>',
        $current_page == 1 ? 'disabled' : '',
        get_pagenum_link($current_page - 1)
    );

    // First page + ellipsis
    if ( $start_page > 1 ) {
        $output .= sprintf(
            '<button class="lp-page-button" onclick="location.href=\'%s\'">1</button>',
            get_pagenum_link(1)
        );
        if ( $start_page > 2 ) {
            $output .= '<span class="lp-ellipsis">...</span>';
        }
    }

    // Middle numbered pages
    for ( $i = $start_page; $i <= $end_page; $i++ ) {
        $output .= sprintf(
            '<button class="lp-page-button %s" onclick="location.href=\'%s\'">%d</button>',
            $i == $current_page ? 'active' : '',
            get_pagenum_link($i),
            $i
        );
    }

    // Ellipsis + last page
    if ( $end_page < $total_pages - 1 ) {
        $output .= '<span class="lp-ellipsis">...</span>';
    }
    if ( $end_page < $total_pages ) {
        $output .= sprintf(
            '<button class="lp-page-button" onclick="location.href=\'%s\'">%d</button>',
            get_pagenum_link($total_pages),
            $total_pages
        );
    }

    // Next button
    $output .= sprintf(
        '<button class="lp-page-button nav" %s onclick="location.href=\'%s\'">Next »</button>',
        $current_page == $total_pages ? 'disabled' : '',
        get_pagenum_link($current_page + 1)
    );

    $output .= '</div>';

    return $output;
}


function lp_register_faq_block() {
    register_block_type( 'lp/faq', array(
        'editor_script'   => 'lp-block',
        'render_callback' => 'lp_render_faq',
        'attributes'      => array(
            'faqTitle' => array(
                'type'    => 'string',
                'default' => 'Frequently Asked Questions',
            ),
            'faqItems' => array(
                'type'    => 'array',
                'default' => array(),
            ),
            'bgColor' => array(
                'type'    => 'string',
                'default' => '',
            ),
            'bgSwitch' => array(
                'type'    => 'boolean',
                'default' => false,
            ),
            'bgImage' => array(
                'type'    => 'string',
                'default' => '',
            ),
        ),
    ));
}
add_action( 'init', 'lp_register_faq_block' );

function lp_render_faq( $attributes ) {
    $faqTitle = isset( $attributes['faqTitle'] ) ? esc_html( $attributes['faqTitle'] ) : 'Frequently Asked Questions';
    $faqItems = isset( $attributes['faqItems'] ) ? $attributes['faqItems'] : array();
    $bgColor = isset( $attributes['bgColor'] ) ? esc_attr($attributes['bgColor']) : '';
    $bgSwitch = isset( $attributes['bgSwitch'] ) ? $attributes['bgSwitch'] : false; // Either background is image or color   
    $bgImage = isset( $attributes['bgImage'] ) ?  esc_url( $attributes['bgImage'] )  : '';

    $style = '';
    if ( $bgSwitch ) {
        $style = 'style="background-image:url('.$bgImage.'); background-size:cover;';
    }else{
        $style = "style='background:$bgColor;'";
    }

    ob_start();
    ?>
    <div class="lp-faq" <?php echo $style; ?>>
        <h3 class="lp-faq-title"><?php echo esc_html($faqTitle); ?></h3>
        <div class="lp-faq-items">
            <?php foreach ( $faqItems as $item ) : ?>
                <div class="lp-faq-item">
                    <h4 class="lp-faq-question"><?php echo esc_html($item['question']); ?></h4>
                    <p class="lp-faq-answer"><?php echo esc_html($item['answer']); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}