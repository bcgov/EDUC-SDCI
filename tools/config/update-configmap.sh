envValue=$1
APP_NAME=$2
OPENSHIFT_NAMESPACE=$3
COMMON_NAMESPACE=$4
KC_CLIENT_SECRET=$5
KC_CLIENT_ID=$6
KC_TOKEN_URL=$7

APP_NAME_UPPER=${APP_NAME^^}

TZVALUE="America/Vancouver"
SOAM_KC_REALM_ID="master"
SOAM_KC=soam-$envValue.apps.silver.devops.gov.bc.ca
siteMinderLogoutUrl=""
HOST_ROUTE="educ-sdci-${OPENSHIFT_NAMESPACE}-${envValue}.apps.silver.devops.gov.bc.ca"
SERVER_FRONTEND="https://educ-sdci-${OPENSHIFT_NAMESPACE}-${envValue}.apps.silver.devops.gov.bc.ca"

if [ "$envValue" = "dev" ]
then
  bannerEnvironment="DEV"
  bannerColor="#dba424"
elif [ "$envValue" = "test" ]
then
  bannerEnvironment="TEST"
  bannerColor="#8d28d7"
fi

echo Creating config map $APP_NAME-backend-config-map
oc create -n $OPENSHIFT_NAMESPACE-$envValue configmap $APP_NAME-backend-config-map --from-literal=TZ=$TZVALUE --from-literal=BANNER_COLOR=$bannerColor --from-literal=BANNER_ENVIRONMENT=$bannerEnvironment --from-literal=SOAM_CLIENT_ID=$KC_CLIENT_SECRET --from-literal=SOAM_TOKEN_URL=$KC_TOKEN_URL --from-literal=SOAM_CLIENT_SECRET=$KC_CLIENT_ID --from-literal=SERVER_FRONTEND="$SERVER_FRONTEND" --from-literal=INSTITUTE_API_URL="https://institute-api-$COMMON_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca/api/v1" --from-literal=LOG_LEVEL=info  --from-literal=NODE_ENV="openshift" --dry-run -o yaml | oc apply -f -
echo
echo Setting environment variables for $APP_NAME-backend-$SOAM_KC_REALM_ID application
oc -n $OPENSHIFT_NAMESPACE-$envValue set env --from=configmap/$APP_NAME-backend-config-map dc/$APP_NAME-backend-main

echo Creating config map $APP_NAME-frontend-config-map
oc create -n $OPENSHIFT_NAMESPACE-$envValue configmap $APP_NAME-frontend-config-map --from-literal=TZ=$TZVALUE --from-literal=HOST_ROUTE=$HOST_ROUTE  --dry-run -o yaml | oc apply -f -
echo
echo Setting environment variables for $APP_NAME-frontend-$SOAM_KC_REALM_ID application
oc -n $OPENSHIFT_NAMESPACE-$envValue set env --from=configmap/$APP_NAME-frontend-config-map dc/$APP_NAME-frontend-main


