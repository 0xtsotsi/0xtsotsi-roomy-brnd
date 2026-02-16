import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('visualizer/:id', './routes/visualizer.$id.tsx'),
    route('login', 'routes/login.tsx'),
    route('community', 'routes/community.tsx'),
    route('pricing', 'routes/pricing.tsx'),
    route('business', 'routes/business.tsx')
] satisfies RouteConfig;
