import SwaggerUI from '@root/src/app/models/swaggerui.model';

const swaggerHandler = new SwaggerUI('openapi.yaml', {
    supportHeaderParams: true,
    customSiteTitle: 'Mitchell-West.com'
});

export default swaggerHandler;
