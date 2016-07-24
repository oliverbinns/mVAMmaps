API calls
=========

This section documents the calls made to the WFP mVAM API.  All calls come from (from table pblStatsSum) and use the paging as described in :doc:`structure`

For getting the regional values (example here Ad Dali in Yemen):

* ADM0_NAME = 'Yemen' AND AdminStrata = 'Ad Dali' AND IndpVars = 'AdminUnits'

For getting the whole country values (example here for Yemen)

* WHERE ADM0_NAME = 'Yemen' AND AdminStrata = 'Yemen' AND IndpVars = 'AMD0'

The data that is returned from the API is put into the global variables APIresponse.ADM0 and APIresponse.ADM1 for country and regional level data respectively.