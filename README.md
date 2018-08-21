# werckerenvtools

Tools to work with wercker environments

## Export

Example:

`werckerenvtools export [organization] [application] [pipeline] --token [token] --include-application false > ENVIRONMENT`

will export the environment variables of the pipeline to file called ENVIRONMENT
Organization, application and pipeline must exist.
`include-application` is optional and defaults to `false` but will include application envvars if true

## Import

Example:

`werckerenvtools import [organization] [application] [pipeline] --token [token] --file ENVIRONMENT`

will import the environment variables of the pipeline from file called ENVIRONMENT
Organization, application and pipeline must exist.

## Sync

Example:

`werckerenvtools sync [organization] [application] [src-pipeline] [dst-pipeline] --token [token]`

will sync the environment variables of the src pipeline to the dst pipeline
Organization, application and pipelines must exist.
