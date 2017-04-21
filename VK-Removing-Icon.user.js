// ==UserScript==
// @name         VK Removing Icon
// @include      https://vk.com/feed
// @version      0.1
// @description  Add additional removing icon for posts outside of dropdown menu
// @author       Anastasia Grineva
// ==/UserScript==

(function() {
    'use strict';
    var css = '.remove-post-icon {position: absolute; right: 13px; top: 24px; font-size: 13px;} .feed_wrap .ui_actions_menu_icons {right: 40px !important;}',
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    // Add CSS for removing icon
    if (style.styleSheet){
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    style.type = 'text/css';
    head.appendChild(style);
    
    // Update posts by page load
    updatePosts();
    
    // Observe DOM change (adding new posts on scroll) and update new posts
    var numOfChanges = 0;
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                numOfChanges++;
            }
            if(numOfChanges >= 10) {
                numOfChanges = 0;
                updatePosts();
            }
        });
    });
    observer.observe(document.getElementById('feed_rows'), { childList: true });
    
    // Update posts by adding them on "Load new posts" button click
    document.querySelector('.feed_new_posts').onclick = function(){
        Feed.showNewPosts();
        updatePosts();
    };
    
    // Update posts by clicking on "News" button in the right menu
    document.getElementById('ui_rmenu_news').onclick = function(){
        numOfChanges = 10; // Notify observer that the post should be updated
        nav.go(this, event);
        updatePosts();
        return false; // dont't reload the page
    };

    // Update posts by clicking on the "News" link in the left menu
    document.getElementById('l_nwsf').onclick = function(){
        numOfChanges = 10; // Notify observer that the post should be updated
        nav.go(this, event, {noback: true, params: {_ref: 'left_nav'}});
        updatePosts();
        return false; // dont't reload the page
    };
    
    // Function for inserting icon to a post
    function addIcon(post) {
        if(post) {
            post.setAttribute("class", post.className + " with-icon");
            var originalRemoveLink = post.querySelector("a[onclick^='feed.ignoreItem']");
            if(originalRemoveLink) {
                var onclickAction = originalRemoveLink.getAttribute("onclick");
                var link = document.createElement("a");
                link.innerHTML = "&#10005;"; // cross sign
                link.setAttribute("onclick", onclickAction);
                link.setAttribute("class", "remove-post-icon");
                post.querySelector(".post_header_info").appendChild(link);
            }
        }
    }

    // Function for processing posts,
    // adds removing icon and special class to each non-updated post
    function updatePosts() {
        console.log("Update posts icons");
        var posts = document.getElementsByClassName('feed_row');
        for (var i = 0; i < posts.length; i++) {
            if(!hasClass(posts[i], "with-icon")) {
                addIcon(posts[i]);
            }
        }
    }
    
    function hasClass(element, cls) {
        return (" " + element.className + " ").indexOf(" " + cls + " ") > -1;
    }
})();