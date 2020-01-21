import SwaggerUI from '@model/swaggerui.model';

class SwaggerService {
    config = new SwaggerUI('openapi.yaml', { supportHeaderParams: true, customSiteTitle: 'mdms-auth' });
    setup = () => this.config.setup();
    serve = () => this.config.serve;
    getJson = () => this.config.openApiConfig;
}

const swaggerService = new SwaggerService();

export default swaggerService;
