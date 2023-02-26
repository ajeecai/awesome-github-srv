export const buildEmail = (
  language: string,
  growingNum: number,
  growingList: string,
  starLevelList: string
): string => {
  const domain = process.env.UI_URL;
  const timeStamp = new Date().toISOString().replace(/T/, " ").split(" ")[0];
  // TODO: This template is copied from internet, may have copyright issue.
  return `
<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;margin: 0 auto !important;padding: 0 !important;height: 100% !important;width: 100% !important;"><head style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"><base href="https://raw.githubusercontent.com/TedGoas/Cerberus/master/cerberus-hybrid.html" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
     <!-- utf-8 works for most cases -->
    <meta name="viewport" content="width=device-width" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"> <!-- Forcing initial-scale shouldn't be necessary -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"> <!-- Use the latest (edge) version of IE rendering engine -->
    <meta name="x-apple-disable-message-reformatting" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
    <title style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">${language} / ${timeStamp}</title> <!-- The title tag shows in email notifications, like Android 4.4. -->

    <!-- Web Font / @font-face : BEGIN -->
    <!-- NOTE: If web fonts are not required, lines 10 - 27 can be safely removed. -->

    <!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->
    <!--[if mso]>
    <style>
        * {
            font-family: sans-serif !important;
        }
    </style>
    <![endif]-->

    <!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->
    <!--[if !mso]><!-->
    <!-- insert web font reference, eg: <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'> -->
    <!--<![endif]-->

    <!-- Web Font / @font-face : END -->

    <!-- CSS Reset : BEGIN -->
    <style style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">

        /* What it does: Remove spaces around the email design added by some email clients. */
        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
        html,
        body {
            margin: 0 auto !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;
        }

        /* What it does: Stops email clients resizing small text. */
        * {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }

        /* What it does: Centers email on Android 4.4 */
        div[style*="margin: 16px 0"] {
            margin: 0 !important;
        }

        /* What it does: Stops Outlook from adding extra spacing to tables. */
        table,
        td {
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
        }

        /* What it does: Fixes webkit padding issue. Fix for Yahoo mail table alignment bug. Applies table-layout to the first 2 tables then removes for anything nested deeper. */
        table {
            border-spacing: 0 !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            margin: 0 auto !important;
        }

        table table table {
            table-layout: auto;
        }

        /* What it does: Uses a better rendering method when resizing images in IE. */
        img {
            -ms-interpolation-mode: bicubic;
        }

        /* What it does: A work-around for email clients meddling in triggered links. */
        *[x-apple-data-detectors], /* iOS */
        .x-gmail-data-detectors, /* Gmail */
        .x-gmail-data-detectors *,
        .aBn {
            border-bottom: 0 !important;
            cursor: default !important;
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
        .a6S {
            display: none !important;
            opacity: 0.01 !important;
        }

        /* If the above doesn't work, add a .g-img class to any image in question. */
        img.g-img + div {
            display: none !important;
        }

        /* What it does: Prevents underlining the button text in Windows 10 */
        .button-link {
            text-decoration: none !important;
        }

        /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
        /* Create one of these media queries for each additional viewport size you'd like to fix */

        /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
        @media  only screen and (min-device-width: 320px) and (max-device-width: 374px) {
            .email-container {
                min-width: 320px !important;
            }
        }

        /* iPhone 6, 6S, 7, 8, and X */
        @media  only screen and (min-device-width: 375px) and (max-device-width: 413px) {
            .email-container {
                min-width: 375px !important;
            }
        }

        /* iPhone 6+, 7+, and 8+ */
        @media  only screen and (min-device-width: 414px) {
            .email-container {
                min-width: 414px !important;
            }
        }

    </style>
    <!-- CSS Reset : END -->

    <!-- Progressive Enhancements : BEGIN -->
    <style style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">

        /* What it does: Hover styles for buttons */
        .button-td,
        .button-a {
            transition: all 100ms ease-in;
        }

        .button-td:hover,
        .button-a:hover {
            background: #555555 !important;
            border-color: #555555 !important;
        }

        /* Media Queries */
        @media  screen and (max-width: 480px) {

            /* What it does: Forces elements to resize to the full width of their container. Useful for resizing images beyond their max-width. */
            .fluid {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                margin-left: auto !important;
                margin-right: auto !important;
            }

            /* What it does: Forces table cells into full-width rows. */
            .stack-column,
            .stack-column-center {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                direction: ltr !important;
            }

            /* And center justify these ones. */
            .stack-column-center {
                text-align: center !important;
            }

            /* What it does: Generic utility class for centering. Useful for images, buttons, and nested tables. */
            .center-on-narrow {
                text-align: center !important;
                display: block !important;
                margin-left: auto !important;
                margin-right: auto !important;
                float: none !important;
            }

            table.center-on-narrow {
                display: inline-block !important;
            }

            /* What it does: Adjust typography on small screens to improve readability */
            .email-container p {
                font-size: 17px !important;
            }
        }

        .badge-secondary {
            color: #fff;
            background-color: #6c757d;
        }

        .badge {
            display: inline-block;
            padding: 0.25em 0.4em;
            font-size: 75%;
            font-weight: 700;
            line-height: 1;
            text-align: center;
            white-space: nowrap;
            vertical-align: baseline;
            border-radius: 0.25rem;
        }

        .gray-links a {
            color: #8A8A8A;
        }

    </style>
    <!-- Progressive Enhancements : END -->

    <!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->
    <!--[if gte mso 9]>
    <xml>
        <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->

</head>
<!--
	The email background color (#ffffff) is defined in three places:
	1. body tag: for most email clients
	2. center tag: for Gmail and Inbox mobile apps and web versions of Gmail, GSuite, Inbox, Yahoo, AOL, Libero, Comcast, freenet, Mail.ru, Orange.fr
	3. mso conditional: For Windows 10 Mail
-->
<body width="100%" bgcolor="#ffffff" style="margin: 0 auto !important;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;padding: 0 !important;height: 100% !important;width: 100% !important;">
<center style="width: 100%;background: #ffffff;text-align: left;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffffff">
        <tr>
            <td>
    <![endif]-->

    <!-- Create white space after the desired preview text so email clients don’t pull other distracting text into the inbox preview. Extend as necessary. -->
    <!-- Preview Text Spacing Hack : BEGIN -->
    <div style="display: none;font-size: 1px;line-height: 1px;max-height: 0px;max-width: 0px;opacity: 0;overflow: hidden;mso-hide: all;font-family: sans-serif;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
        ‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;
    </div>
    <!-- Preview Text Spacing Hack : END -->

    <!--
        Set the email width. Defined in two places:
        1. max-width for all clients except Desktop Windows Outlook, allowing the email to squish on narrow but never go wider than 680px.
        2. MSO tags for Desktop Windows Outlook enforce a 680px width.
        Note: The Fluid and Responsive templates have a different width (600px). The hybrid grid is more "fragile", and I've found that 680px is a good width. Change with caution.
    -->
    <div style="max-width: 680px;margin: auto;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" class="email-container">
        <!--[if mso]>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="680" align="center">
            <tr>
                <td>
        <![endif]-->

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 680px;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;border-spacing: 0 !important;border-collapse: collapse !important;table-layout: fixed !important;margin: 0 auto !important;">
            <tbody style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
            <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                <td style="padding: 20px 0;text-align: center;font-family: sans-serif;font-size: 24px;color: white;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                ${language} / ${timeStamp}
                </td>
            </tr>
            </tbody>
        </table>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 680px;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;border-spacing: 0 !important;border-collapse: collapse !important;table-layout: fixed !important;margin: 0 auto !important;" class="email-container">

            <tbody style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">

            <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                <td bgcolor="#f0d8d8" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;border-spacing: 0 !important;border-collapse: collapse !important;table-layout: fixed !important;margin: 0 auto !important;">
                        <tbody style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                        <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                            <td style="padding: 40px 40px 20px;text-align: left;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                                <h1 style="margin: 0;font-family: sans-serif;font-size: 24px;line-height: 125%;color: #333333;font-weight: normal;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                    ${timeStamp}, some interesting things happened on ${language} last week:</h1>
                            </td>
                        </tr>
                        <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                            <td style="padding: 0 40px 40px;font-family: sans-serif;font-size: 15px;line-height: 140%;color: #555555;text-align: left;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                                <h2 style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">Entered Top ${growingNum} Growing repos</h2>
                                    ${growingList}
                                <h2 style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">Reached star levels</h2>
                                    ${starLevelList}                                 
                            </td>
                        </tr>
                        <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                            <td style="padding: 0 40px 40px;font-family: sans-serif;font-size: 15px;line-height: 140%;color: #555555;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                                <!-- Button : BEGIN -->
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: auto;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;table-layout: fixed !important;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;border-spacing: 0 !important;border-collapse: collapse !important;">
                                    <tbody style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                    <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                        <td style="border-radius: 3px;background: #ffffff;text-align: center;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;transition: all 100ms ease-in;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;" class="button-td">
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                                <!-- Button : END -->
                            </td>
                        </tr>

                        </tbody>
                    </table>
                </td>
            </tr>
            </tbody>
        </table>

        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
    </div>

    <!-- Full Bleed Background Section : BEGIN -->
    <table role="presentation" style="background-color: white;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;border-spacing: 0 !important;border-collapse: collapse !important;table-layout: fixed !important;margin: 0 auto !important;" cellspacing="0" cellpadding="0" border="0" align="center" width="100%">
        <tbody style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
        <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
            <td valign="top" align="center" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                <div style="max-width: 680px;margin: auto;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" class="email-container">
                    <!--[if mso]>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="680" align="center">
                        <tr>
                            <td>
                    <![endif]-->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;border-spacing: 0 !important;border-collapse: collapse !important;table-layout: fixed !important;margin: 0 auto !important;">
                        <tbody style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                        <tr style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                            <td width="50%" class="gray-links" style="padding: 40px;text-align: center;font-family: sans-serif;font-size: 13px;line-height: 110%;color: #8a8a8a;vertical-align: top;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;">
                                You subscribed on ${domain}, <a href="${domain}" style="color: #8a8a8a;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">login</a> to unsubscribe from this list.<br style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                <br style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <!--[if mso]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                </div>
            </td>
        </tr>
        </tbody>
    </table>
    <!-- Full Bleed Background Section : END -->

    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
</center>
</html>`;
};

export const listGenerator = (
  repo: string,
  repoUrl: string,
  description: string,
  star: number,
  increasedStar: number
) => {
  return (
    `<ul style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
<li style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">

    <a href="${repoUrl}" style="color: #242734;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
    ${repo}</a>

    (⭐️${star}` +
    (increasedStar ? `  🚀${increasedStar}` : ``) +
    `)

    <div style="-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
        ${description}
    </div>

</li>
</ul>`
  );
};
