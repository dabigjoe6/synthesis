const generateEmailTemplate = (posts) => {
  if (posts && posts.length > 0) {
    let postsHTML = "";
    
    posts.forEach((post) => {
      postsHTML += `<tr>
      <td
        style="
          background-color: #0d1117;
          padding-top: 12px;
          padding-bottom: 12px;
          padding-right: 0;
          padding-left: 0;
        "
        align="center"
        valign="top"
      >
        <img
          style="
            width: 264px;
            height: auto;
            max-width: 100%;
            display: block;
          "
          alt=""
          src="${post.image}"
          role="presentation"
          tabindex="0"
        />
      </td>
    </tr>
    <tr>
      <td
        style="
          background-color: #0d1117;
          padding-top: 12px;
          padding-bottom: 12px;
          padding-right: 24px;
          padding-left: 24px;
        "
        class="m_2752502063724214168mceSpacing-24"
        valign="top"
      >
        <div
          class="m_2752502063724214168mceText"
          style="
            font-size: 16px;
            text-align: center;
            width: 100%;
          "
        >
          <h3 class="m_2752502063724214168last-child">
            <span style="color: #66ced6"
              >${post.title}</span
            >
          </h3>
        </div>
      </td>
    </tr>
    <tr>
      <td
        style="
          background-color: #0d1117;
          padding-top: 12px;
          padding-bottom: 12px;
          padding-right: 24px;
          padding-left: 24px;
        "
        class="m_2752502063724214168mceSpacing-24"
        valign="top"
      >
        <div
          class="m_2752502063724214168mceText"
          style="
            font-size: 16px;
            line-height: 1.5;
            text-align: left;
            width: 100%;
          "
        >
          <p class="m_2752502063724214168last-child">
            <span style="color: #66ced6">
              <span style="font-size: 15px">
                <span
                  >${post.description}</span
                >
              </span>
            </span>
          </p>
        </div>
      </td>
    </tr>
    <tr>
      <td
        style="
          background-color: #0d1117;
          padding-top: 12px;
          padding-bottom: 12px;
          padding-right: 24px;
          padding-left: 24px;
        "
        class="m_2752502063724214168mceSpacing-24"
        align="center"
        valign="top"
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
        >
          <tbody>
            <tr>
              <td
                style="
                  background-color: #66ced6;
                  border-radius: 0;
                  text-align: center;
                "
                valign="top"
              >
                <a
                  href="${post.url}"
                  style="
                    background-color: #66ced6;
                    border-radius: 0;
                    border: 1px solid #000000;
                    color: #000000;
                    display: inline-block;
                    font-family: 'Helvetica Neue',
                      Helvetica, Arial, Verdana,
                      sans-serif;
                    font-size: 16px;
                    font-weight: normal;
                    font-style: normal;
                    padding: 16px 28px;
                    text-decoration: none;
                    min-width: 30px;
                  "
                  target="_blank"
                  data-saferedirecturl="${post.url}"
                  >Read More</a
                >
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td
        style="
          background-color: #0d1117;
          padding-top: 20px;
          padding-bottom: 20px;
          padding-right: 24px;
          padding-left: 24px;
        "
        class="m_2752502063724214168mceSpacing-24"
        valign="top"
      >
        <table
          border="0"
          cellpadding="0"
          cellspacing="0"
          width="100%"
          style="background-color: #0d1117"
          role="presentation"
        >
          <tbody>
            <tr>
              <td
                style="
                  min-width: 100%;
                  border-top: 6px solid #66ced6;
                "
                valign="top"
              ></td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>`;
    });

    return (
      `<center>
      <table
        border="0"
        cellpadding="0"
        cellspacing="0"
        height="100%"
        width="100%"
        id="m_2752502063724214168bodyTable"
        style="background-color: rgb(102, 206, 214)"
      >
        <tbody>
          <tr>
            <td
              id="m_2752502063724214168root"
              class="m_2752502063724214168bodyCell"
              align="center"
              valign="top"
            >
              <table
                align="center"
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 660px"
                role="presentation"
              >
                <tbody>
                  <tr>
                    <td
                      style="
                        background-position: center;
                        background-repeat: no-repeat;
                        background-size: cover;
                      "
                      valign="top"
                    >
                      <table
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        role="presentation"
                      >
                        <tbody>
                          <tr>
                            <td
                              style="
                                background-color: #0d1117;
                                background-position: center;
                                background-repeat: no-repeat;
                                background-size: cover;
                              "
                              class="m_2752502063724214168mceColumn"
                              valign="top"
                              colspan="12"
                              width="100%"
                            >
                              <table
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style="
                                        background-color: #0d1117;
                                        padding-top: 12px;
                                        padding-bottom: 12px;
                                        padding-right: 24px;
                                        padding-left: 24px;
                                      "
                                      class="m_2752502063724214168mceSpacing-24"
                                      align="center"
                                      valign="top"
                                    >
                                      <img
                                        width="131"
                                        style="
                                          width: 131px;
                                          height: auto;
                                          max-width: 100%;
                                          display: block;
                                        "
                                        alt="Logo"
                                        src="https://ci4.googleusercontent.com/proxy/c6jSTYmbIk18OibLTOmi_xO29ibkVdj7YHkzgwfG5rzm3aPz437HgUKMgucPewzBZW41ACtIhj46sl9CfCYB2trEWFU89GyVFYLlyxxmywPGRULCD0BuyyD99m5hLk1wTD7xWgQAsOALWkSEM910WW5nWbdU9TnqCTvvXn8HwnaTu-JQAD_kxLU=s0-d-e1-ft#https://dim.mcusercontent.com/cs/effd130f128376b2740653a12/images/6aba83cc-c18c-8390-27c3-4151a0dafef2.png?w=131&amp;dpr=2"
                                        class="CToWUd"
                                        data-bit="iit"
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      style="
                                        background-color: #0d1117;
                                        padding-top: 12px;
                                        padding-bottom: 12px;
                                        padding-right: 24px;
                                        padding-left: 24px;
                                      "
                                      class="m_2752502063724214168mceSpacing-24"
                                      valign="top"
                                    >
                                      <div
                                        class="m_2752502063724214168mceText"
                                        style="
                                          font-size: 16px;
                                          text-align: center;
                                          width: 100%;
                                        "
                                      >
                                        <h1 class="m_2752502063724214168last-child">
                                          <span style="color: #66ced6"
                                            >Your MorningBrew</span
                                          >
                                        </h1>
                                      </div>
                                    </td>
                                  </tr>` + postsHTML
    );
  } else {
    return "";
  }
};

export default generateEmailTemplate;
