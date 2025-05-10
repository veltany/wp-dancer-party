<?php
/*
Plugin Name: WP Dancer Party
Plugin URI: https://soundwela.net/
Description: Animated dancers react to your WordPress audio players! Play to dance, pause to chill.
Version: 1.0.1.14
Author: Samuel Chukwu
Author URI: https://soundwela.net/
License: GPL2
Text Domain: wp-dancer-party
Author URI: https://github.com/veltany 
GitHub Plugin URI: https://github.com/veltany/wp-dancer-party
GitHub Branch: main
Requires at least: 6.6
Requires PHP: 8.2
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit; // No direct access
}

// Plugin Constants
define('WPDANCER_DIR', plugin_dir_path(__FILE__));
define('WPDANCER_URL', plugin_dir_url(__FILE__));
define('WPDANCER_VER', "1.0.1.14");


//-------------------------------------
// PLUGIN UPDATES
require WPDANCER_DIR.'plugin-update/plugin-update-checker.php';
use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

$myUpdateChecker = PucFactory::buildUpdateChecker(
	'https://github.com/veltany/wp-dancer-party',
	 WPDANCER_DIR.'wp-dancer-party.php', //Full path to the main plugin file or functions.php.,
	'wp-dancer-party'
);

//$myUpdateChecker->getVcsApi()->enableReleaseAssets();
//Set the branch that contains the stable release.
$myUpdateChecker->setBranch('main');
//------------------------------------


// Enqueue assets
// Load Admin CSS
function wpdancer_admin_enqueue($hook) { 
    if ($hook == 'toplevel_page_wp-dancer-party') {
        
        // Load WordPress Media Uploader
        wp_enqueue_media();
        
        // Load Admin CSS
        wp_enqueue_style('wpdancer-admin-css', WPDANCER_URL. 'assets/css/admin.css', array(), WPDANCER_VER );
        
        
        // Load Admin JS (for media uploader)
        wp_enqueue_script('wpdancer-admin-js', WPDANCER_URL. 'assets/js/admin.js', array('jquery'), WPDANCER_VER , true);
    
    }
}
add_action('admin_enqueue_scripts', 'wpdancer_admin_enqueue');



function wpdancer_enqueue_assets() {
    wp_enqueue_style('wpdancer-style', WPDANCER_URL.'assets/css/dancer.css');
    wp_enqueue_style('wpdancer-frontend-css', WPDANCER_URL.'assets/css/frontend.css', array(), WPDANCER_VER);

    wp_enqueue_script('wp-dancer-script', WPDANCER_URL. 'assets/js/dancer.js', array(), WPDANCER_VER, true);

    // Localize plugin URL for JS
    $options = get_option('wpdancer_options');
    
     $dancers = [];

     $all_dancers = isset($options['custom_dancers']) ? $options['custom_dancers'] : array();
     if (!empty($all_dancers)) {
     foreach ($all_dancers as $index => $dancer_url) {
         $dancers[] = $dancer_url;
     }
     }
     else {
        // Fallback to default dancer if none selected
        $dancers[] = WPDANCER_URL . 'assets/images/default-dancer.gif'; 
     }
         

    $localized_data = array(
        'dancers'  => $dancers,
        'dancer_count' => isset($options['dancer_count']) ? $options['dancer_count'] : 5,
        'custom_dancer' => isset($options['custom_dancer']) ? $options['custom_dancer'] : '',
        'sensitivity' => isset($options['sensitivity']) ? $options['sensitivity'] : 100,
        'visibility' => isset($options['visibility']) ? $options['visibility'] : 'on',
        'url' => WPDANCER_URL
    );
  
    // Pass the localized settings to the JavaScript file
    wp_localize_script('wp-dancer-script', 'wpdancer_plugin', $localized_data);

}
add_action('wp_enqueue_scripts', 'wpdancer_enqueue_assets'); 


// Add the admin page and settings
function wpdancer_add_admin_page() {
    add_menu_page(
        'Dancer Party Settings',        // Page Title
        'Dancer Party',                 // Menu Title
        'manage_options',               // Capability
        'wp-dancer-party',              // Menu Slug
        'wpdancer_settings_page',       // Function to display settings page
        'dashicons-heart',              // Icon
        99                              // Position
    );

    // Register settings group and settings
    //register_setting('wpdancer_options_group', 'wpdancer_options');
}
add_action('admin_menu', 'wpdancer_add_admin_page');

// Register settings and sanitize
function wpdancer_register_settings() {
    register_setting('wpdancer_options_group', 'wpdancer_options', 'wpdancer_options_validate');
} 
// Save settings
function wpdancer_options_validate($input) {
    $input['visibility'] = isset($input['visibility']) ? 'on' : 'off'; // Save visibility as 'on' or 'off'
   
   // Sanitize dancer URLs
    for ($i = 1; $i <= 3; $i++) {
        if (!empty($input["dancer_$i"])) {
            $input["dancer_$i"] = esc_url_raw($input["dancer_$i"]);
        }
    }
   
    return $input;
}
add_action('admin_init', 'wpdancer_register_settings');


// Render the settings page
function wpdancer_settings_page() {
    // Get current options
    $options = get_option('wpdancer_options');
    
    // Display the settings saved message if available
    if (isset($_GET['settings-updated']) && $_GET['settings-updated'] == 'true') {
        add_settings_error('wpdancer_messages', 'wpdancer_message', 'Settings saved successfully!', 'updated');
        settings_errors('wpdancer_messages');
    }
    ?>
    <div class="wrap">
        <h1>Dancer Party Settings</h1>
        <form method="post" action="options.php">
            <?php settings_fields('wpdancer_options_group'); ?>
            <h3>Customize Dancers</h3>

            <!-- Dancer Quantity -->
            <label for="wpdancer_dancer_count">Number of Dancers:</label>
            <input type="number" id="wpdancer_dancer_count" name="wpdancer_options[dancer_count]" value="<?php echo esc_attr($options['dancer_count'] ?? 5); ?>" min="1" max="20" /><br><br>

            <!-- Custom Dancer GIF -->
            <label for="wpdancer_custom_dancer">Upload Custom Dancer GIF:</label>
            <input type="file" id="wpdancer_custom_dancer" name="wpdancer_options[custom_dancer]" accept="image/gif" /><br><br>

            <!-- Movement Sensitivity -->
            <label for="wpdancer_sensitivity">Movement Sensitivity:</label>
            <input type="range" id="wpdancer_sensitivity" name="wpdancer_options[sensitivity]" min="50" max="200" value="<?php echo esc_attr($options['sensitivity'] ?? 100); ?>" /><br><br>

            <!-- Dancer Visibility -->
            <label for="wpdancer_visibility">Hide Dancers on Pause:</label>
            <input type="checkbox" id="wpdancer_visibility" name="wpdancer_options[visibility]" <?php echo isset($options['visibility']) && $options['visibility'] === 'on' ? 'checked' : ''; ?> /><br><br>

             <h2>Custom Dancers</h2>
              <p>You can upload up to 3 custom dancers (Transparent PNG or GIF recommended).</p>

             <div id="wpdancer_custom_dancers">
                <?php
                 $dancers = isset($options['custom_dancers']) ? $options['custom_dancers'] : array();
               if (!empty($dancers)) {
                 foreach ($dancers as $index => $dancer_url) {
               ?>
              <div class="wpdancer-dancer-item" style="margin-bottom: 15px;">
                <input type="text" name="wpdancer_options[custom_dancers][]" value="<?php echo esc_url($dancer_url); ?>" style="width: 55%;" />
                <button type="button" class="button wpdancer_upload_button">Select Image</button>
                <button type="button" class="button wpdancer_remove_button">Remove</button>
                <br>
                <img src="<?php echo esc_url($dancer_url); ?>" class="wpdancer-preview" style="margin-top:5px; max-width:80px; max-height:80px; display: inline-block;"/>
               </div>
              <?php
        }
    }
    ?>
</div>

<button type="button" class="button button-primary" id="wpdancer_add_dancer">Add Dancer</button>

          

            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

