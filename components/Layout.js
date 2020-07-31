import React from 'react';

const Layout = props => {
    // the props.content property comes from the content prop
    // passed to Layout from its parent components.
    return (
        <div>
            <main>{props.content}</main>
        </div>
    )
}

export default Layout;